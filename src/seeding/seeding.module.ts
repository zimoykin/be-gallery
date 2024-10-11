import { Module } from '@nestjs/common';
import { SeedingService } from './seeding.service';
import { DynamodbModule } from '../dynamo-db/dynamo-db.module';
import { S3BucketModule } from '../s3-bucket/s3-bucket.module';
import { ImageCompressorModule } from '../image-compressor/image-compressor.module';
import PhotoSchema from '../photos/models/photo.model';
import { Profile } from '../profiles/models/profile.model';
import { Folder } from '../folders/models/folder.model';
import { Topic } from '../topics/models/topic.model';
import { AmqpModule } from '../lib/amqp.module';
import { Offer } from '../offers/models/offer.model';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    DynamodbModule.forFeature(Profile),
    DynamodbModule.forFeature(Folder),
    MongooseModule.forFeature([PhotoSchema]),
    DynamodbModule.forFeature(Topic),
    DynamodbModule.forFeature(Offer),
    S3BucketModule.forFeature('photos'),
    S3BucketModule.forFeature('preview'),
    S3BucketModule.forFeature('compressed'),
    AmqpModule.forFeature('folder_favorite_changed'),
    ImageCompressorModule,
  ],
  providers: [SeedingService]
})
export class SeedingModule { }
