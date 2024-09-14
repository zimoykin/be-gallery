import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DynamoDbRepository } from 'src/dynamo-db/dynamo-db.repository';
import { Photo, PhotoData } from './photo.model';
import { InjectRepository } from 'src/dynamo-db/decorators/inject-model.decorator';
import { S3BucketService } from 'src/s3-bucket/s3-bucket.service';
import { InjectS3Bucket } from 'src/s3-bucket/inject-s3-bucket.decorator';
import { ImageCompressorService } from 'src/image-compressor/image-compressor.service';
import { InternalServerError } from '@aws-sdk/client-dynamodb';
import { PhotoType } from './enums/photo-type.enum';

@Injectable()
export class PhotoService {
    private readonly logger = new Logger(PhotoService.name);
    constructor(
        @InjectRepository(Photo.name)
        private readonly photoRepository: DynamoDbRepository,
        @InjectS3Bucket('photos')
        private readonly s3BucketServiceOriginal: S3BucketService,
        @InjectS3Bucket('preview')
        private readonly s3BucketServicePreview: S3BucketService,
        @InjectS3Bucket('compressed')
        private readonly s3BucketServiceCompressed: S3BucketService,
        private readonly imageCompressorService: ImageCompressorService,
    ) { }

    /**
     * Resizes an image and saves it to s3.
     * @param file the buffer of the image
     * @param photoId the id of the photo
     * @throws NotFoundException if photoId does not exist
     * @throws InternalServerError if there are any errors
     */
    private async resizeImage(file: Buffer, photoId: string, key: string) {
        const photo = await this.photoRepository.findById(photoId);
        if (!photo) {
            throw new NotFoundException(
                'could not find photo, could not resize image',
            );
        }

        const imageSize = await this.imageCompressorService.getImageSize(file);

        const [previewWidth, previewHeight] = [
            Math.min(320, imageSize.width),
            Math.min(320, imageSize.height),
        ];
        const compressedWidth = Math.min(1280, imageSize.width);

        const preview = await this.imageCompressorService.compressImage(
            file,
            previewWidth,
            previewHeight,
        );
        const bucketPreview = await this.s3BucketServicePreview.upload(
            preview,
            key,
        );

        const compressed = await this.imageCompressorService.compressImage(
            file,
            compressedWidth,
        );
        const bucketCompressed = await this.s3BucketServiceCompressed.upload(
            compressed,
            key,
        );

        await this.photoRepository
            .update(photoId, {
                ...photo,
                compressed: { ...bucketCompressed, width: compressedWidth },
                preview: {
                    ...bucketPreview,
                    width: previewWidth,
                    height: previewHeight,
                },
            })
            .catch((err) => {
                this.logger.error(err);
                throw new InternalServerError(err);
            });
    }

    private async getUrlByType(type: PhotoType, photo: Photo) {
        switch (type) {
            case 'preview':
                if (photo.preview?.key)
                    return this.s3BucketServicePreview.generateSignedUrl(photo.preview?.key);
                break;
            case 'compressed':
                if (photo.compressed?.key)
                    return this.s3BucketServiceCompressed.generateSignedUrl(photo.compressed?.key);
                break;
            default:
                if (photo.bucket?.key)
                    return this.s3BucketServiceOriginal.generateSignedUrl(photo.bucket?.key);
                break;
        }
    }

    async createPhotoObject(
        folderId: string,
        userId: string,
        data: Partial<Photo>,
        file: any,
    ) {

        const photos = await this.photoRepository.readByFilter({
            match: {
                folderId: folderId,
                userId: userId
            }
        });

        if (photos.length >= 10) {
            throw new Error(
                `You can't create more than 10 photos for a folder. You have ${photos.length}`,
            );
        }

        const bucket = await this.s3BucketServiceOriginal.upload(
            file.buffer,
            `${userId}/${folderId}/${file.originalname}`,
        );
        return this.photoRepository
            .create<PhotoData>({
                folderId,
                userId,
                bucket: bucket,
                camera: data.camera ?? 'no info',
                sortOrder: data.sortOrder || (photos.length + 1),
                ...data,
            })
            .then((data: Photo) => {
                this.resizeImage(
                    file.buffer,
                    data.id,
                    `${userId}/${folderId}/${file.originalname}`,
                );
                return data;
            });
    }

    async getSpecificPhotoByIdByFolderId(
        folderId: string,
        userId: string,
        id: string,
        type: PhotoType
    ): Promise<Photo & { url: string; }> {
        const photo = await this.photoRepository.readByFilter<Photo>({
            match: {
                folderId: folderId,
                id: id,
                userId: userId,
            },
        });

        if (photo.length === 0) {
            throw new NotFoundException();
        } else
            return {
                ...photo[0],
                url: await this.getUrlByType(type, photo[0]),
            };
    }

    async getPhotosByFolderId(
        folderId: string,
        type: PhotoType,
        userId: string,
    ): Promise<Array<Photo & { url: string; }>> {
        const photos = await this.photoRepository.readByFilter<Photo>({
            match: {
                folderId: folderId,
                userId: userId,
            },
        });

        if (photos.length === 0) {
            return [];
        } else {
            const sighnedPhotos: Array<Photo & { url: string; }> = [];

            for await (const photo of photos) {
                const url = await this.getUrlByType(type, photo);
                if (url)
                    sighnedPhotos.push({ ...photo, url: url });
            }
            return sighnedPhotos.sort((a, b) => a.sortOrder - b.sortOrder);
        }
    }

    async getTotalPhotosByFolderId(folderId: string, userId: string): Promise<number> {
        const count = await this.photoRepository.countByFilter({
            match: {
                folderId: folderId,
                userId: userId,
            },
        });

        return count ?? 0;
    }

    async removePhoto(folderId: string, userId: string, id: string) {
        const existingPhoto = await this.photoRepository.readByFilter<Photo>({
            match: {
                id: id,
                folderId: folderId,
                userId: userId,
            },
        });
        if (existingPhoto.length === 0) {
            throw new NotFoundException();
        } else {
            if (existingPhoto[0].bucket?.key)
                await this.s3BucketServiceOriginal.deleteFile(
                    existingPhoto[0].bucket?.key,
                );
            if (existingPhoto[0].preview?.key)
                await this.s3BucketServicePreview.deleteFile(
                    existingPhoto[0].preview?.key,
                );
            if (existingPhoto[0].compressed?.key)
                await this.s3BucketServiceCompressed.deleteFile(
                    existingPhoto[0].compressed?.key,
                );

            return this.photoRepository.remove(id);
        }
    }

    async removePhotosByFolderId(folderId: string, userId: string) {
        const photos = await this.photoRepository.readByFilter<Photo>({
            match: {
                folderId: folderId,
                userId: userId,
            },
        });

        for await (const photo of photos) {
            await this.s3BucketServiceOriginal.deleteFile(photo.bucket.key);
            await this.photoRepository.remove(photo.id);
        }
    }
}
