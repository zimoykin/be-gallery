import { Module } from '@nestjs/common';
import { DbSeedingService } from './db-seeding.service';
import { DynamodbModule } from '../dynamo-db/dynamo-db.module';
import { Profile } from '../profiles/profile.model';
import { Folder } from '../folders/folder.model';
import { Offer } from '../offers/models/offer.model';
import { DbSeedingController } from './db-seeding.controller';
import { Topic } from '../topic/models/topic.model';
import { Message } from '../messages/models/message.model';
import { ProfileService } from '../profiles/profile.service';
import { S3BucketModule } from '../s3-bucket/s3-bucket.module';
import { ImageCompressorModule } from '../image-compressor/image-compressor.module';
import { PhotoService } from '../photos/photo.service';
import { Photo } from '../photos/models/photo.model';

@Module({
  imports: [
    DynamodbModule.forFeature(Profile),
    DynamodbModule.forFeature(Folder),
    DynamodbModule.forFeature(Offer),
    DynamodbModule.forFeature(Topic),
    DynamodbModule.forFeature(Message),
    DynamodbModule.forFeature(Photo),
    S3BucketModule.forFeature('profile'),
    S3BucketModule.forFeature('photos'),
    S3BucketModule.forFeature('preview'),
    S3BucketModule.forFeature('compressed'),
    ImageCompressorModule
  ],
  providers: [DbSeedingService, ProfileService, PhotoService],
  controllers: [DbSeedingController]
})
export class DbSeedingModule { }
