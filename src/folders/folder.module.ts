import { Module } from '@nestjs/common';
import { FolderController } from './folder.controller';
import { FolderService } from './folder.service';
import { DynamodbModule } from 'src/dynamo-db/dynamo-db.module';
import { Folder } from './folder.model';
import { PhotoModule } from '../photos/photo.module';

@Module({
  imports: [DynamodbModule.forFeature(Folder), PhotoModule],
  controllers: [FolderController],
  providers: [FolderService],
})
export class FolderModule {}
