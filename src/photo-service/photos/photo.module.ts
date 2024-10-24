import { Module } from '@nestjs/common';
import { PhotoController } from './photo.controller';
import { PhotoService } from './photo.service';
import { S3BucketModule } from '../../libs/s3-bucket/s3-bucket.module';
import { ImageCompressorModule } from '../../libs/image-compressor/image-compressor.module';
import { PublicPhotoService } from './public-photo.service';
import { PhotoPublicController } from './photo-public.controller';
import { PhotoConsumer } from './photo.consumer';
import { AmqpModule } from '../../libs/amqp/amqp.module';
import { PhotoDatabaseModule } from 'src/libs/models/photo/photo.module';
import { FolderDatabaseModule } from 'src/libs/models/folder/folder.module';
import { ProfileDatabaseModule } from 'src/libs/models/profile/profile.module';

@Module({
  imports: [
    PhotoDatabaseModule,
    FolderDatabaseModule,
    ProfileDatabaseModule,
    S3BucketModule.forFeature('photos'),
    S3BucketModule.forFeature('preview'),
    S3BucketModule.forFeature('compressed'),
    ImageCompressorModule,
    AmqpModule.forFeature('folder_favorite_changed'),
    AmqpModule.forFeature('folder_dominant_color')
  ],
  controllers: [PhotoController, PhotoPublicController],
  providers: [PhotoService, PublicPhotoService, PhotoConsumer],
  exports: [PhotoService],
})
export class PhotoModule { }
