import { Module } from '@nestjs/common';
import { PhotoController } from './photo.controller';
import { PhotoService } from './photo.service';
import { DynamodbModule } from 'src/dynamo-db/dynamo-db.module';
import { Photo } from './models/photo.model';
import { S3BucketModule } from 'src/s3-bucket/s3-bucket.module';
import { ImageCompressorModule } from 'src/image-compressor/image-compressor.module';
import { PhotoOfTheDay } from './models/photo-of-the-day.model';
import { PublicPhotoService } from './public-photo.service';
import { PhotoPublicController } from './photo-public.controller';
import { ProfileModule } from 'src/profiles/profile.module';

@Module({
  imports: [
    DynamodbModule.forFeature(Photo),
    DynamodbModule.forFeature(PhotoOfTheDay),
    S3BucketModule.forFeature('photos'),
    S3BucketModule.forFeature('preview'),
    S3BucketModule.forFeature('compressed'),
    ImageCompressorModule,
    ProfileModule,
  ],
  controllers: [PhotoController, PhotoPublicController],
  providers: [PhotoService, PublicPhotoService],
  exports: [PhotoService],
})
export class PhotoModule {}
