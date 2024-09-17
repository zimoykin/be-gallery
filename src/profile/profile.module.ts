import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { DynamodbModule } from 'src/dynamo-db/dynamo-db.module';
import { Profile } from './profile.model';
import { PublicProfileController } from './profile-public.controller';
import { S3BucketModule } from 'src/s3-bucket/s3-bucket.module';
import { ImageCompressorModule } from 'src/image-compressor/image-compressor.module';

@Module({
  imports: [
    DynamodbModule.forFeature(Profile),
    S3BucketModule.forFeature('profile'),
    ImageCompressorModule
  ],
  controllers: [ProfileController, PublicProfileController],
  providers: [ProfileService],
  exports: [ProfileService]
})
export class ProfileModule { }
