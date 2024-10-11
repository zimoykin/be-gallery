import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '../../libs/dynamo-db/decorators/inject-model.decorator';
import { Folder } from '../../libs/interfaces/models/folder.model';
import { DynamoDbRepository } from '../../libs/dynamo-db/dynamo-db.repository';
import { PhotoService } from '../../photo-service/photos/photo.service';

@Injectable()
export class PublicFolderService {
  private readonly logger = new Logger(PublicFolderService.name);

  constructor(
    // @ts-ignore //
    @InjectRepository(Folder)
    private readonly folderRepository: DynamoDbRepository<Folder>,
    private readonly photoService: PhotoService,
  ) { }

  async findFoldersByProfileId(profileId: string) {
    const folders = await this.folderRepository.find<Folder>({
      match: { profileId, privateAccess: 0 },
    });

    const photoIds = folders
      .filter((folder) => folder.favoriteFotoId)
      .map((folder) => folder.favoriteFotoId ?? '');
    const photos = await this.photoService.findPhotosByIds(photoIds);
    
    return folders.map( folder => ({
      ...folder,
      url: photos.find((photo) => photo.id === folder.favoriteFotoId)?.url ?? '',
    }))
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
