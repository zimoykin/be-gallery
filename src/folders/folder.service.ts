import { BadGatewayException, Injectable, Logger, NotFoundException } from '@nestjs/common';
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

  async findUserFolderByIdAndUserId(id: string, userId: string) {

    const profile = await this.profileService.findProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.findUserFolderByIdAndProfileId(id, profile.id);
  }

  async findUserFolderByIdAndProfileId(id: string, profileId: string) {
    const count = await this.photoService
      .getTotalPhotosByFolderId(id, profileId);

    return this.folderRepository
      .findOneByFilter<Folder>({
        match: { id, profileId: profileId },
      })
      .then((data) => ({ ...data, totalPhotos: count || 0 }))
      .catch((err) => {
        this.logger.error(err);
        throw err;
      });
  }

  async findAllByUserId(userId: string) {
    const profile = await this.profileService.findProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const folders = await this.folderRepository.readByFilter<Folder>({ match: { profileId: profile.id } });
    return Promise.all(folders.map(async folder => {
      const count = await this.photoService.getTotalPhotosByFolderId(folder.id, profile.id);
      return { ...folder, totalPhotos: count };
    }));
  }

  async findAllByProfileId(profileId: string) {
    const folders = await this.folderRepository.readByFilter<Folder>({ match: { profileId: profileId } });
    return Promise.all(folders.map(async folder => {
      const count = await this.photoService.getTotalPhotosByFolderId(folder.id, profileId);
      return { ...folder, totalPhotos: count };
    }));
  }

  async createFolder(data: Partial<Folder>, userId: string) {
    const profile = await this.profileService.findProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const userFolders = await this.findAllByProfileId(profile.id);
    if (userFolders.length >= 10) {
      throw new BadGatewayException(
        `You can't create more than 10 folders. You have ${userFolders.length}`,
      );
    }
    return this.folderRepository.create({ ...data, profileId: profile.id });
  }

  async updateFolder(id: string, data: FolderInputDto, userId: string) {
    const profile = await this.profileService.findProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const userFolder = await this.findUserFolderByIdAndProfileId(id, profile?.id);
    if (!userFolder) {
      throw new NotFoundException(`Folder with id ${id} not found`);
    }

    return this.folderRepository.update(id, { ...data, profileId: profile.id });
  }

  async removeFolder(id: string, userId: string) {
    const profile = await this.profileService.findProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    const userFolder = await this.findUserFolderByIdAndProfileId(id, profile?.id);
    if (!userFolder) {
      throw new NotFoundException(`Folder with id ${id} not found`);
    }
    //delete all photos from folder
    await this.photoService.removePhotosByFolderId(id, profile.id);
    return this.folderRepository.remove(id);
  }
}
