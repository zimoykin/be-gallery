import { Module } from '@nestjs/common';
import { FolderController } from './folder.controller';
import { FolderService } from './folder.service';
import { DynamodbModule } from 'src/dynamo-db/dynamo-db.module';
import { Folder } from './models/folder.model';
import { PhotoModule } from '../photos/photo.module';
import { PublicFolderController } from './folder-public.controller';
import { PublicFolderService } from './folder-public.service';
import { ProfileModule } from '../profiles/profile.module';
import { profiles } from '../profiles/models/profile.seed';
import { folders } from './models/folder.seeds';

@Module({
  imports: [
    DynamodbModule.forFeature(Folder, {
      seeding() {
        return profiles
          .map(profile => {
            return folders(profile.id);
          })
          .flat();
      },
    }),
    PhotoModule, ProfileModule],
  controllers: [FolderController, PublicFolderController],
  providers: [FolderService, PublicFolderService],
})
export class FolderModule { }
