import { Module } from '@nestjs/common';
import { FolderController } from './folder.controller';
import { FolderService } from './folder.service';
import { DynamodbModule } from '../../libs/dynamo-db/dynamo-db.module';
import { Folder } from '../../libs/models/models/folder.model';
import { PhotoModule } from '../../photo-service/photos/photo.module';
import { PublicFolderController } from './folder-public.controller';
import { ProfileModule } from '../profiles/profile.module';
import { AmqpModule } from '../../libs/amqp/amqp.module';
import { PublicFolderService } from './folder-public.service';
import { FolderConsumer } from './folder.consumer';

@Module({
  imports: [
    DynamodbModule.forFeature(Folder),
    PhotoModule,
    ProfileModule,
    AmqpModule.forFeature('folder_dominant_color')
  ],
  controllers: [FolderController, PublicFolderController],
  providers: [FolderService, PublicFolderService, FolderConsumer],
  exports: [FolderService],
})
export class FolderModule {}
