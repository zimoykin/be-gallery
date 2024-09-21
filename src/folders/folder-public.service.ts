import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '../dynamo-db/decorators/inject-model.decorator';
import { Folder } from './folder.model';
import { DynamoDbRepository } from '../dynamo-db/dynamo-db.repository';
import { PhotoService } from 'src/photos/photo.service';
import { ProfileService } from 'src/profile/profile.service';

@Injectable()
export class PublicFolderService {
  private readonly logger = new Logger(PublicFolderService.name);

  constructor(
    @InjectRepository(Folder.name)
    private readonly folderRepository: DynamoDbRepository,
    private readonly photoService: PhotoService,
    private readonly profileService: ProfileService,
  ) { }

  async findFoldersByProfileId(profileId: string) {
    const folders = await this.folderRepository
      .readByFilter<Folder>({
        match: { profileId, privateAccess: false }
      });

    const result = [];
    for await (const folder of folders) {
      const url = await this.photoService.getFavoritePhotoUrlByFolderId(folder.id);
      result.push({ ...folder, url });
    }

    return result;
  }

  async findFolderByIdAndProfileId(profileId: string, folderId: string) {
    const filter = {
      match: { id: folderId, profileId, private: false }
    };

    const [data, count] = await Promise.all([
      this.folderRepository.readByFilter<Folder>(filter),
      this.photoService.getTotalPhotosByFolderId(folderId, profileId)
    ]);

    return { ...data, totalPhotos: count || 0 };
  }

}
