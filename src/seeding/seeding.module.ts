import { Module } from '@nestjs/common';
import { SeedingService } from './seeding.service';
import { DynamodbModule } from '../libs/dynamo-db/dynamo-db.module';
import { S3BucketModule } from '../libs/s3-bucket/s3-bucket.module';
import { ImageCompressorModule } from '../libs/image-compressor/image-compressor.module';
import { Topic } from '../commercial-service/topics/models/topic.model';
import { AmqpModule } from '../libs/amqp/amqp.module';
import PhotoSchema from '../libs/models/photo/photo.model';
import { Folder } from '../libs/models/folder/folder.model';
import { Offer, OfferSchema } from '../libs/models/offers/offer.model';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileDatabaseModule } from 'src/libs/models/profile/profile.module';

@Module({
  imports: [
    ProfileDatabaseModule,
    MongooseModule.forFeature([PhotoSchema]),
    MongooseModule.forFeature([{ name: Offer.name, schema: OfferSchema }]),
    //
    DynamodbModule.forFeature(Folder),
    DynamodbModule.forFeature(Topic),
    //
    S3BucketModule.forFeature('photos'),
    S3BucketModule.forFeature('preview'),
    S3BucketModule.forFeature('compressed'),
    S3BucketModule.forFeature('profile'),
    //
    AmqpModule.forFeature('folder_favorite_changed'),
    ImageCompressorModule,
  ],
  providers: [SeedingService]
})
export class SeedingModule { }
