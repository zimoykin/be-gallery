import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '../../libs/dynamo-db/decorators/inject-model.decorator';
import { Folder } from '../../libs/models/folder/folder.model';
import { DynamoDbRepository } from '../../libs/dynamo-db/dynamo-db.repository';
import { PhotoService } from '../../photo-service/photos/photo.service';
import { FolderRepository } from 'src/libs/models/folder/folder.repository';

@Injectable()
export class PublicFolderService {
  private readonly logger = new Logger(PublicFolderService.name);

  constructor(
    private readonly folderRepository: FolderRepository,
    private readonly photoService: PhotoService,
  ) { }

  async findFoldersByProfileId(profileId: string) {
    const folders = await this.folderRepository.find({
      match: { profileId, privateAccess: 0 },
    });

    const photoIds = folders
      .filter((folder) => folder.favoriteFotoId)
      .map((folder) => folder.favoriteFotoId ?? '');
    const photos = await this.photoService.findPhotosByIds(photoIds);

    return folders.map(folder => ({
      ...folder,
      url: photos.find((photo) => photo.id === folder.favoriteFotoId)?.url ?? '',
    }));
  }

  async findFolderByIdAndProfileId(profileId: string, folderId: string) {
    const filter = {
      match: { id: folderId, profileId, private: false },
    };

    const [data, count] = await Promise.all([
      this.folderRepository.find(filter),
      this.photoService.getTotalPhotosByFolderId(folderId, profileId),
    ]);

    return { ...data, totalPhotos: count || 0 };
  }
}
