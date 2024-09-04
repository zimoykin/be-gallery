import { Module } from '@nestjs/common';
import { FolderController } from './folder.controller';
import { FolderService } from './folder.service';
import { DynamodbModule } from 'src/dynamo-db/dynamo-db.module';
import { Folder } from './folder.model';

@Module({
  imports: [
    DynamodbModule.forFeature(Folder)
  ],
  controllers: [FolderController],
  providers: [FolderService]
})
export class FolderModule {}
