import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '../dynamo-db/decorators/inject-model.decorator';
import { Folder } from './folder.model';
import { DynamoDbRepository } from '../dynamo-db/dynamo-db.repository';
import { PhotoService } from 'src/photos/photo.service';

@Injectable()
export class PublicFolderService {
  private readonly logger = new Logger(PublicFolderService.name);

  constructor(
    @InjectRepository(Folder.name)
    private readonly folderRepository: DynamoDbRepository,
    private readonly photoService: PhotoService
  ) { }

  async findFoldersByUserId(userId: string) {
    return this.folderRepository
      .findOneByFilter<Folder>({
        match: { userId, private: false }
      });
  }

  async findFolderById(userId: string, folderId: string) {
    const filter = {
      match: { id: folderId, userId, private: false }
    };

    const [data, count] = await Promise.all([
      this.folderRepository.findOneByFilter<Folder>(filter),
      this.photoService.getTotalPhotosByFolderId(folderId, userId)
    ]);

    return { ...data, totalPhotos: count || 0 };
  }

}
