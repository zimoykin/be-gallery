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

  async findFoldersByUserId(profileId: string) {
    return this.folderRepository
      .readByFilter<Folder>({
        match: { profileId, private: false }
      });
  }

  async findFolderByIdAndProfileId(profileId: string, folderId: string) {
    const filter = {
      match: { id: folderId, profileId, private: false }
    };

    const [data, count] = await Promise.all([
      this.folderRepository.findOneByFilter<Folder>(filter),
      this.photoService.getTotalPhotosByFolderId(folderId, profileId)
    ]);

    return { ...data, totalPhotos: count || 0 };
  }

}
