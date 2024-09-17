import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from 'src/dynamo-db/decorators/inject-model.decorator';
import { Folder } from './folder.model';
import { DynamoDbRepository } from 'src/dynamo-db/dynamo-db.repository';
import { FolderInputDto } from './dtos/folder-input.dto';
import { PhotoService } from 'src/photos/photo.service';
import { ProfileService } from 'src/profile/profile.service';

@Injectable()
export class FolderService {
  private readonly logger = new Logger(FolderService.name);

  constructor(
    @InjectRepository(Folder.name)
    private readonly folderRepository: DynamoDbRepository,
    private readonly photoService: PhotoService,
    private readonly profileService: ProfileService
  ) { }

  async findUserFolderById(id: string, userId: string) {

    const count = await this.photoService
      .getTotalPhotosByFolderId(id, userId);

    return this.folderRepository
      .findOneByFilter<Folder>({
        match: { id, userId }
      })
      .then((data) => ({ ...data, totalPhotos: count || 0 }))
      .catch((err) => {
        this.logger.error(err);
        throw err;
      });
  }

  async findAllByUserId(userId: string) {
    const folders = await this.folderRepository.readByFilter<Folder>({ match: { userId } });
    return Promise.all(folders.map(async folder => {
      const count = await this.photoService.getTotalPhotosByFolderId(folder.id, userId);
      return { ...folder, totalPhotos: count };
    }));
  }

  async createFolder(data: Partial<Folder>, userName: string) {
    const profile = await this.profileService.findProfileByUserId(data.userId);
    if (!profile) {
      await this.profileService.createProfile(data.userId, userName);
    }

    const userFolders = await this.findAllByUserId(data.userId);
    if (userFolders.length >= 10) {
      throw new Error(
        `You can't create more than 10 folders. You have ${userFolders.length}`,
      );
    }
    return this.folderRepository.create(data);
  }

  async updateFolder(id: string, data: FolderInputDto, userId: string) {
    return this.folderRepository.update(id, { ...data, userId });
  }

  async removeFolder(id: string, userId: string) {
    const userFolder = await this.findUserFolderById(id, userId);
    if (!userFolder) {
      throw new NotFoundException(`Folder with id ${id} not found`);
    }
    //delete all photos from folder
    await this.photoService.removePhotosByFolderId(id, userId);
    return this.folderRepository.remove(id);
  }
}
