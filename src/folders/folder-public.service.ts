import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '../dynamo-db/decorators/inject-model.decorator';
import { Folder } from './models/folder.model';
import { DynamoDbRepository } from '../dynamo-db/dynamo-db.repository';
import { PhotoService } from 'src/photos/photo.service';

@Injectable()
export class PublicFolderService {
  private readonly logger = new Logger(PublicFolderService.name);

  constructor(
    // @ts-ignore //
    @InjectRepository(Folder.name)
    private readonly folderRepository: DynamoDbRepository<Folder>,
    private readonly photoService: PhotoService,
  ) { }

  async findFoldersByProfileId(profileId: string) {
    return this.folderRepository.find<Folder>({
      match: { profileId, privateAccess: 0 },
    });
  }

  async findFolderByIdAndProfileId(profileId: string, folderId: string) {
    const filter = {
      match: { id: folderId, profileId, private: false },
    };

    const [data, count] = await Promise.all([
      this.folderRepository.find<Folder>(filter),
      this.photoService.getTotalPhotosByFolderId(folderId, profileId),
    ]);

    return { ...data, totalPhotos: count || 0 };
  }
}
