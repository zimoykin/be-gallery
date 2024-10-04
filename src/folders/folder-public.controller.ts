import { Controller, Get, Logger, Param } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { FolderOutputDto } from './dtos/folder-output.dto';
import { PublicFolderService } from './folder-public.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Public')
@Controller('api/v1/public/folders')
export class PublicFolderController {
  private readonly logger = new Logger(PublicFolderController.name);
  constructor(private readonly folderService: PublicFolderService) {}

  @Get('/:profileId')
  async findAll(@Param('profileId') profileId: string) {
    return this.folderService.findFoldersByProfileId(profileId).then((data) => {
      return plainToInstance(FolderOutputDto, data);
    });
  }

  @Get('/:profileId/:folderId')
  async findOneById(
    @Param('profileId') profileId: string,
    @Param('folderId') folderId: string,
  ) {
    return this.folderService.findFolderByIdAndProfileId(profileId, folderId);
  }
}
