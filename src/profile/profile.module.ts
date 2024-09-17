import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { DynamodbModule } from 'src/dynamo-db/dynamo-db.module';
import { Profile } from './profile.model';
import { PublicProfileController } from './profile-public.controller';

@Module({
  imports: [
    DynamodbModule.forFeature(Profile)
  ],
  controllers: [ProfileController, PublicProfileController],
  providers: [ProfileService],
  exports: [ProfileService]
})
export class ProfileModule { }
