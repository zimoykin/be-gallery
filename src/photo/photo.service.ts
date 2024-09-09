import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DynamoDbRepository } from 'src/dynamo-db/dynamo-db.repository';
import { Photo, PhotoData } from './photo.model';
import { InjectRepository } from 'src/dynamo-db/decorators/inject-model.decorator';
import { S3BucketService } from 'src/s3-bucket/s3-bucket.service';
import { InjectS3Bucket } from 'src/s3-bucket/inject-s3-bucket.decorator';

@Injectable()
export class PhotoService {
    private readonly logger = new Logger(PhotoService.name);
    constructor(
        @InjectRepository(Photo.name) private readonly photoRepository: DynamoDbRepository,
        @InjectS3Bucket('photos') private readonly s3BucketService: S3BucketService
    ) { }

    async createPhotoObject(folderId: string, userId: string, data: Partial<Photo>, file: any) {
        const url = await this.s3BucketService.upload(file, `${userId}/${folderId}/${file.originalname}`);
        return this.photoRepository.create<PhotoData>({
            folderId,
            userId,
            bucket: url,
            camera: data.camera ?? 'no info',
            sortOrder: data.sortOrder ?? 0,
            ...data,
        });
    }

    async getSpecificPhotoByIdByFolderId(folderId: string, userId: string, id: string) {
        const photos = await this.photoRepository.readByFilter({
            match: {
                folderId: folderId,
                id: id,
                userId: userId
            }
        });

        for await (const photo of photos) {
            photo.url = await this.s3BucketService.generateSignedUrl(photo.url?.key);
        }
        return photos;

    }
    async getPhotosByFolderId(folderId: string, userId: string) {
        const photos = await this.photoRepository.readByFilter({
            match: {
                folderId: folderId,
                userId: userId
            }
        });

        for await (const photo of photos) {
            photo.url = await this.s3BucketService.generateSignedUrl(photo.bucket?.key);
        }
        return photos;
    }

    async removePhoto(folderId: string, userId: string, id: string) {
        const existingPhoto = await this.photoRepository.readByFilter({
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
            return this.photoRepository.remove(id);
        }
    }

    async removePhotosByFolderId(folderId: string, userId: string) {
        const photos = await this.photoRepository.readByFilter({
            match: {
                folderId: folderId,
                userId: userId
            }
        });

        for await (const photo of photos) {
            await this.s3BucketService.deleteFile(photo.url?.key);
            await this.photoRepository.remove(photo.id);
        }
    }
}
