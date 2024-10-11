import { Module } from '@nestjs/common';
import { FolderController } from './folder.controller';
import { FolderService } from './folder.service';
import { PhotoModule } from '../../photo-service/photos/photo.module';
import { PublicFolderController } from './folder-public.controller';
import { ProfileModule } from '../profiles/profile.module';
import { AmqpModule } from '../../libs/amqp/amqp.module';
import { PublicFolderService } from './folder-public.service';
import { FolderConsumer } from './folder.consumer';
import { FolderDatabaseModule } from 'src/libs/models/folder/folder.module';

@Module({
  imports: [
    FolderDatabaseModule,
    PhotoModule,
    ProfileModule,
    AmqpModule.forFeature('folder_dominant_color')
  ],
  controllers: [FolderController, PublicFolderController],
  providers: [FolderService, PublicFolderService, FolderConsumer],
  exports: [FolderService],
})
export class FolderModule {}
