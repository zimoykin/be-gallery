import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { FolderInputDto } from './dtos/folder-input.dto';
import { ProfileService } from '../profiles/profile.service';
import { Folder } from '../../libs/models/folder/folder.model';
import { FolderRepository } from 'src/libs/models/folder/folder.repository';

@Injectable()
export class FolderService {
  private readonly logger = new Logger(FolderService.name);

  constructor(
    private readonly folderRepository: FolderRepository,
    private readonly profileService: ProfileService,
  ) { }


  async findFolderByIdAndProfileId(id: string, profileId: string) {
    const folder = await this.folderRepository.findOne({
      match: { id, profileId },
    });
    if (!folder) {
      throw new NotFoundException('folder not found');
    }

    return folder;
  }

  async findByFolderId(id: string) {
    return this.folderRepository.findOne({
      match: { id },
    });
  }


  async findAllByProfileId(profileId: string) {
    const folders = await this.folderRepository.find({
      match: { profileId: profileId },
    });
    return folders;
  }

  async createFolder(data: Partial<Folder>, profileId: string) {
    return this.folderRepository.create({ ...data, profileId: profileId });
  }

  async updateFolderByUserId(id: string, data: FolderInputDto, userId: string) {
    const profile = await this.profileService.findProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return this.folderRepository.update(id, { ...data, profileId: `${profile._id}` });
  }
  async updateFolderByProfileId(id: string, data: Partial<Folder>, profileId: string) {
    return this.folderRepository.update(id, { ...data, profileId: profileId });
  }

  async removeFolder(id: string, userId: string) {
    const profile = await this.profileService.findProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    //TODO: AMQP EVENT
    //TODO: remove photos by folder id
    return this.folderRepository.remove(id);
  }
}
