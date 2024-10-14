import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { PublicProfileController } from './profile-public.controller';
import { S3BucketModule } from '../../libs/s3-bucket/s3-bucket.module';
import { ImageCompressorModule } from '../../libs/image-compressor/image-compressor.module';
import { ProfileConsumer } from './profile.consumer';
import { AmqpModule } from '../../libs/amqp/amqp.module';
import { ProfileService } from './profile.service';
import { ProfileDatabaseModule } from '../../libs/models/profile/profile.module';

@Module({
  imports: [
    ProfileDatabaseModule,
    S3BucketModule.forFeature('profile'),
    ImageCompressorModule,
    AmqpModule.forFeature('user_created'),
    AmqpModule.forFeature('favorite_equipment')
  ],
  controllers: [ProfileController, PublicProfileController],
  providers: [ProfileService, ProfileConsumer],
  exports: [ProfileService],
})
export class ProfileModule { }
