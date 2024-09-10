import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DynamoDbRepository } from 'src/dynamo-db/dynamo-db.repository';
import { Photo, PhotoData } from './photo.model';
import { InjectRepository } from 'src/dynamo-db/decorators/inject-model.decorator';
import { S3BucketService } from 'src/s3-bucket/s3-bucket.service';
import { InjectS3Bucket } from 'src/s3-bucket/inject-s3-bucket.decorator';
import { ImageCompressorService } from 'src/image-compressor/image-compressor.service';
import { InternalServerError } from '@aws-sdk/client-dynamodb';

@Injectable()
export class PhotoService {
    private readonly logger = new Logger(PhotoService.name);
    constructor(
        @InjectRepository(Photo.name) private readonly photoRepository: DynamoDbRepository,
        @InjectS3Bucket('photos') private readonly s3BucketServiceOriginal: S3BucketService,
        @InjectS3Bucket('preview') private readonly s3BucketServicePreview: S3BucketService,
        @InjectS3Bucket('compressed') private readonly s3BucketServiceCompressed: S3BucketService,
        private readonly imageCompressorService: ImageCompressorService
    ) { }

    /**
     * Resizes an image and saves it to s3.
     * @param file the buffer of the image
     * @param photoId the id of the photo
     * @throws NotFoundException if photoId does not exist
     * @throws InternalServerError if there are any errors
     */
    private async resizeImage(file: Buffer, photoId: string, key: string) {
        let photo = await this.photoRepository.findById(photoId);
        if (!photo) {
            throw new NotFoundException('could not find photo, could not resize image');
        }

        const preview = await this.imageCompressorService.compressImage(file, 320, 320);
        let bucketPreview = await this.s3BucketServicePreview.upload(preview, key);

        photo = await this.photoRepository.update(photoId, { ...photo, preview: { ...bucketPreview, width: 320, height: 320 } }).catch(err => {
            this.logger.error(err);
            throw new InternalServerError(err);
        });

        bucketPreview = null;

        const compressed = await this.imageCompressorService.compressImage(file, 1280, 1280);
        bucketPreview = await this.s3BucketServiceCompressed.upload(compressed, key);
        await this.photoRepository.update(photoId, { ...photo, compressed: { ...bucketPreview, width: 1280, height: 1280 } })
            .catch(err => {
                this.logger.error(err);
                throw new InternalServerError(err);
            });

        bucketPreview = null;
    }

    async createPhotoObject(folderId: string, userId: string, data: Partial<Photo>, file: any) {
        const bucket = await this.s3BucketServiceOriginal.upload(file.buffer, `${userId}/${folderId}/${file.originalname}`);
        return this.photoRepository.create<PhotoData>({
            folderId,
            userId,
            bucket: bucket,
            camera: data.camera ?? 'no info',
            sortOrder: data.sortOrder ?? 0,
            ...data,
        }).then((data: Photo) => {
            this.resizeImage(file.buffer, data.id, `${userId}/${folderId}/${file.originalname}`);
            return data;
        });
    }

    async getSpecificPhotoByIdByFolderId(folderId: string, userId: string, id: string): Promise<Photo & { url: string; }> {
        const photo = await this.photoRepository.readByFilter<Photo>({
            match: {
                folderId: folderId,
                id: id,
                userId: userId
            }
        });

        if (photo.length === 0) {
            throw new NotFoundException();
        } else
            return {
                ...photo[0],
                url: await this.s3BucketServiceOriginal.generateSignedUrl(photo[0].bucket.key)
            };
    }

    async getPhotosByFolderId(folderId: string, userId: string): Promise<Array<Photo & { url: string; }>> {
        const photos = await this.photoRepository.readByFilter<Photo>({
            match: {
                folderId: folderId,
                userId: userId
            }
        });

        if (photos.length === 0) {
            return [];
        } else {

            const sighnedPhotos: Array<Photo & { url: string; }> = [];

            for await (const photo of photos) {
                sighnedPhotos.push({
                    ...photo,
                    url: await this.s3BucketServiceOriginal.generateSignedUrl(photo.bucket.key)
                });
            }
            return sighnedPhotos;
        }
    }

    async removePhoto(folderId: string, userId: string, id: string) {
        const existingPhoto = await this.photoRepository.readByFilter<Photo>({
            match: {
                id: id,
                folderId: folderId,
                userId: userId
            }
        });
        if (existingPhoto.length === 0) {
            throw new NotFoundException();
        }
        else {
            await this.s3BucketServiceOriginal.deleteFile(existingPhoto[0].bucket.key);
            return this.photoRepository.remove(id);

        }
    }

    async removePhotosByFolderId(folderId: string, userId: string) {
        const photos = await this.photoRepository.readByFilter<Photo>({
            match: {
                folderId: folderId,
                userId: userId
            }
        });

        for await (const photo of photos) {
            await this.s3BucketServiceOriginal.deleteFile(photo.bucket.key);
            await this.photoRepository.remove(photo.id);
        }
    }
}
