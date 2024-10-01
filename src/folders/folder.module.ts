import { Module } from '@nestjs/common';
import { FolderController } from './folder.controller';
import { FolderService } from './folder.service';
import { DynamodbModule } from 'src/dynamo-db/dynamo-db.module';
import { Folder } from './folder.model';
import { PhotoModule } from '../photos/photo.module';
import { PublicFolderController } from './folder-public.controller';
import { PublicFolderService } from './folder-public.service';
import { ProfileModule } from 'src/profiles/profile.module';

@Module({
  imports: [DynamodbModule.forFeature(Folder), PhotoModule, ProfileModule],
  controllers: [FolderController, PublicFolderController],
  providers: [FolderService, PublicFolderService],
})
export class FolderModule { }
