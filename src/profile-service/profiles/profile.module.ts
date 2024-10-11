import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { DynamodbModule } from '../../libs/dynamo-db/dynamo-db.module';
import { Profile } from '../../libs/interfaces/models/profile.model';
import { PublicProfileController } from './profile-public.controller';
import { S3BucketModule } from '../../libs/s3-bucket/s3-bucket.module';
import { ImageCompressorModule } from '../../libs/image-compressor/image-compressor.module';
import { ProfileConsumer } from './profile.consumer';
import { EquipmentModule } from '../equipments/equipment.module';
import { AmqpModule } from '../../libs/amqp/amqp.module';
import { ProfileService } from './profile.service';

@Module({
  imports: [
    DynamodbModule.forFeature(Profile),
    S3BucketModule.forFeature('profile'),
    ImageCompressorModule,
    EquipmentModule,
    AmqpModule.forFeature('user_created'),
  ],
  controllers: [ProfileController, PublicProfileController],
  providers: [ProfileService, ProfileConsumer],
  exports: [ProfileService],
})
export class ProfileModule { }
