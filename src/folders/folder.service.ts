import {
  BadGatewayException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from 'src/dynamo-db/decorators/inject-model.decorator';
import { Folder } from './models/folder.model';
import { DynamoDbRepository } from '../dynamo-db/dynamo-db.repository';
import { FolderInputDto } from './dtos/folder-input.dto';
import { ProfileService } from '../profiles/profile.service';

@Injectable()
export class FolderService {
  private readonly logger = new Logger(FolderService.name);

  constructor(
    // @ts-ignore //
    @InjectRepository(Folder.name)
    private readonly folderRepository: DynamoDbRepository<Folder>,
    private readonly profileService: ProfileService,
  ) { }

  async findFolderById(id: string, profileId: string) {
    const folder = await this.folderRepository.findOneByFilter({
      match: { id, profileId },
    });
    if (!folder) {
      throw new NotFoundException('folder not found');
    }

    return folder;
  }

  async findByFolderId(id: string) {
    return this.folderRepository.findOneByFilter<Folder>({
      match: { id },
    });
  }


  async findAllByProfileId(profileId: string) {
    const folders = await this.folderRepository.find<Folder>({
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
    return this.folderRepository.update(id, { ...data, profileId: profile.id });
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
