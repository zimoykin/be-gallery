import { Module } from '@nestjs/common';
import { AmqpModule } from '@zimoykin/amqp';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { DynamodbModule } from '../dynamo-db/dynamo-db.module';
import { Profile } from './models/profile.model';
import { PublicProfileController } from './profile-public.controller';
import { S3BucketModule } from '../s3-bucket/s3-bucket.module';
import { ImageCompressorModule } from '../image-compressor/image-compressor.module';
import { profiles } from './models/profile.seed';
import { ProfileConsumer } from './profile.consumer';

@Module({
  imports: [
    DynamodbModule.forFeature(Profile, {
      seeding: profiles
    }),
    S3BucketModule.forFeature('profile'),
    ImageCompressorModule,
    AmqpModule.forFeature(Profile.name)
  ],
  controllers: [ProfileController, PublicProfileController],
  providers: [ProfileService, ProfileConsumer],
  exports: [ProfileService]
})
export class ProfileModule { }
