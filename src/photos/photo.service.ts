import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DynamoDbRepository } from 'src/dynamo-db/dynamo-db.repository';
import { Photo, PhotoData } from './models/photo.model';
import { InjectRepository } from 'src/dynamo-db/decorators/inject-model.decorator';
import { S3BucketService } from 'src/s3-bucket/s3-bucket.service';
import { InjectS3Bucket } from 'src/s3-bucket/inject-s3-bucket.decorator';
import { ImageCompressorService } from 'src/image-compressor/image-compressor.service';
import { InternalServerError } from '@aws-sdk/client-dynamodb';
import { PhotoType } from './enums/photo-type.enum';
import { ProfileService } from 'src/profile/profile.service';

@Injectable()
export class PhotoService {
    private readonly logger = new Logger(PhotoService.name);
    constructor(
        @InjectRepository(Photo.name)
        private readonly photoRepository: DynamoDbRepository<Photo>,
        @InjectS3Bucket('photos')
        private readonly s3BucketServiceOriginal: S3BucketService,
        @InjectS3Bucket('preview')
        private readonly s3BucketServicePreview: S3BucketService,
        @InjectS3Bucket('compressed')
        private readonly s3BucketServiceCompressed: S3BucketService,
        private readonly imageCompressorService: ImageCompressorService,
        private readonly profileService: ProfileService
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

        const profile = await this.profileService.findProfileByUserId(userId);
        if (!profile) {
            throw new Error('Profile not found');
        }

        const photos = await this.photoRepository.readByFilter({
            match: {
                folderId: folderId,
                profileId: profile.id
            }
        });

        if (photos.length >= 10) {
            throw new Error(
                `You can't create more than 10 photos for a folder. You have ${photos.length}`,
            );
        }

        const bucket = await this.s3BucketServiceOriginal.upload(
            file.buffer,
            `${profile.id}/${folderId}/${file.originalname}`,
        );
        return this.photoRepository
            .create<PhotoData>({
                ...data,
                folderId,
                profileId: profile.id,
                bucket: bucket,
                camera: data.camera ?? 'no info',
                sortOrder: data.sortOrder || (photos.length + 1),
            })
            .then(async (data: Photo) => {
                await this.resizeImage(
                    file.buffer,
                    data.id,
                    `${profile.id}/${folderId}/${file.originalname}`,
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

        const profile = await this.profileService.findProfileByUserId(userId);
        if (!profile) {
            throw new Error('Profile not found');
        }

        const photo = await this.photoRepository.readByFilter<Photo>({
            match: {
                folderId: folderId,
                id: id,
                profileId: profile.id,
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

    async findPhotoById(id: string): Promise<Photo & { url: string; }> {
        const photo = await this.photoRepository.findById(id);
        if (!photo) {
            throw new NotFoundException();
        }

        return {
            ...photo,
            url: await this.getUrlByType(PhotoType.PREVIEW, photo),
        };
    }

    async getPhotosByFolderIdAndProfileId(
        folderId: string,
        type: PhotoType,
        profileId: string,
        privateAccess?: boolean
    ): Promise<Array<Photo & { url: string; }>> {

        const photos = await this.photoRepository.readByFilter<Photo>({
            match: {
                folderId: folderId,
                profileId: profileId,
                privateAccess
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


    async getPhotosByFolderIdAndUserId(
        folderId: string,
        type: PhotoType,
        profileId: string,
        privateAccess?: boolean
    ): Promise<Array<Photo & { url: string; }>> {
        return this.getPhotosByFolderIdAndProfileId(folderId, type, profileId, privateAccess);
    }

    async getTotalPhotosByFolderId(folderId: string, profileId: string): Promise<number> {
        const count = await this.photoRepository.countByFilter({
            match: {
                folderId: folderId,
                profileId: profileId,
            },
        });

        return count ?? 0;
    }

    async updatePhoto(
        profileId: string, folderId: string, id: string, data: Partial<Photo>
    ) {
        const photo = await this.photoRepository.findOneByFilter({
            match: {
                profileId: profileId,
                folderId: folderId,
                id: id
            }
        });
        if (!photo) {
            throw new NotFoundException();
        }

        if (photo.favorite === false && data.favorite) {
            //set to all other photos in the folder to false
            await this.photoRepository.updateByFilter({
                match: {
                    folderId: folderId,
                    profileId: profileId,
                }
            }, { favorite: false });
        }

        return this.photoRepository.update(id, data);

    }

    async removePhoto(folderId: string, profileId: string, id: string) {
        const existingPhoto = await this.photoRepository.findOneByFilter<Photo>({
            match: {
                id: id,
                folderId: folderId,
                profileId: profileId
            },
        });

        if(!existingPhoto) {
            throw new NotFoundException();
        }

        if (existingPhoto.bucket?.key)
            await this.s3BucketServiceOriginal.deleteFile(
                existingPhoto.bucket?.key,
            );
        if (existingPhoto.preview?.key)
            await this.s3BucketServicePreview.deleteFile(
                existingPhoto.preview?.key,
            );
        if (existingPhoto.compressed?.key)
            await this.s3BucketServiceCompressed.deleteFile(
                existingPhoto.compressed?.key,
            );

        return this.photoRepository.remove(id);

    }

    async removePhotosByFolderId(folderId: string, profileId: string) {
        const photos = await this.photoRepository.readByFilter<Photo>({
            match: {
                folderId: folderId,
                profileId: profileId,
            },
        });

        for await (const photo of photos) {
            await this.s3BucketServiceOriginal.deleteFile(photo.bucket.key);
            await this.photoRepository.remove(photo.id);
        }
    }

    async getTheLastPhoto(): Promise<Photo | null> {
        const photos = await this.photoRepository.readByFilter({});
        if (photos.length === 0) {
            return null;
        }
        return photos[photos.length - 1];
    }

    async getFavoritePhotoUrlByFolderId (folderId: string) {
        const favorite = await this.photoRepository.findOneByFilter({
            match: {
                folderId: folderId,
                favorite: true
            }
        });
        if (favorite) {
            return await this.getUrlByType(PhotoType.PREVIEW, favorite);
        } else {
            const photo = await this.photoRepository.findOneByFilter({
                match: {
                    folderId: folderId
                }
            });
            if (photo) {
                return await this.getUrlByType(PhotoType.PREVIEW, photo);
            }
            return null;
        }
    }
}
