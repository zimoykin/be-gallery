import { forwardRef, Module } from '@nestjs/common';
import { PhotoController } from './photo.controller';
import { PhotoService } from './photo.service';
import { DynamodbModule } from '../../libs/dynamo-db/dynamo-db.module';
import PhotoSchema from './models/photo.model';
import { S3BucketModule } from '../../libs/s3-bucket/s3-bucket.module';
import { ImageCompressorModule } from '../../libs/image-compressor/image-compressor.module';
import { PhotoOfTheDay } from './photo-of-the-day.model';
import { PublicPhotoService } from './public-photo.service';
import { PhotoPublicController } from './photo-public.controller';
import { FolderModule } from '../../profile-service/folders/folder.module';
import { PhotoConsumer } from './photo.consumer';
import { AmqpModule } from '../../libs/amqp/amqp.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileModule } from 'src/profile-service/profiles/profile.module';
@Module({
  imports: [
    MongooseModule.forFeature([PhotoSchema]),
    DynamodbModule.forFeature(PhotoOfTheDay),
    S3BucketModule.forFeature('photos'),
    S3BucketModule.forFeature('preview'),
    S3BucketModule.forFeature('compressed'),
    ImageCompressorModule,
    ProfileModule,
    forwardRef(() => FolderModule),
    AmqpModule.forFeature('folder_favorite_changed'),
    AmqpModule.forFeature('folder_dominant_color'),
  ],
  controllers: [PhotoController, PhotoPublicController],
  providers: [PhotoService, PublicPhotoService, PhotoConsumer],
  exports: [PhotoService],
})
export class PhotoModule { }
