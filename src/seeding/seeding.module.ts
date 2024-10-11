import { Module } from '@nestjs/common';
import { SeedingService } from './seeding.service';
import { DynamodbModule } from '../libs/dynamo-db/dynamo-db.module';
import { S3BucketModule } from '../libs/s3-bucket/s3-bucket.module';
import { ImageCompressorModule } from '../libs/image-compressor/image-compressor.module';
import { Profile } from '../libs/models/profile/profile.model';
import { Topic } from '../commercial-service/topics/models/topic.model';
import { AmqpModule } from '../libs/amqp/amqp.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Offer } from '../commercial-service/offers/models/offer.model';
import PhotoSchema from '../libs/models/photo/photo.model';
import { Folder } from '../libs/models/folder/folder.model';

@Module({
  imports: [
    MongooseModule.forFeature([PhotoSchema]),
    //
    DynamodbModule.forFeature(Profile),
    DynamodbModule.forFeature(Folder),
    DynamodbModule.forFeature(Topic),
    DynamodbModule.forFeature(Offer),
    //
    S3BucketModule.forFeature('photos'),
    S3BucketModule.forFeature('preview'),
    S3BucketModule.forFeature('compressed'),
    //
    AmqpModule.forFeature('folder_favorite_changed'),
    ImageCompressorModule,
  ],
  providers: [SeedingService]
})
export class SeedingModule { }
