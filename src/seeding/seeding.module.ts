import { Module } from '@nestjs/common';
import { SeedingService } from './seeding.service';
import { DynamodbModule } from 'src/dynamo-db/dynamo-db.module';
import { S3BucketModule } from 'src/s3-bucket/s3-bucket.module';
import { ImageCompressorModule } from 'src/image-compressor/image-compressor.module';
import PhotoSchema from 'src/photos/models/photo.model';
import { Profile } from 'src/profiles/models/profile.model';
import { Folder } from 'src/folders/models/folder.model';
import { Topic } from 'src/topics/models/topic.model';
import { AmqpModule } from 'src/lib/amqp.module';
import { Offer } from 'src/offers/models/offer.model';
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
