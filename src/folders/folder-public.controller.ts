import {
  Controller,
  Get,
  Logger,
  Param,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { FolderOutputDto } from './dtos/folder-output.dto';
import { PublicFolderService } from './folder-public.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Public')
@Controller('api/v1/public/folders')
export class PublicFolderController {
  private readonly logger = new Logger(PublicFolderController.name);
  constructor(private readonly folderService: PublicFolderService) { }

  @Get('/:userId')
  async findAll(
    @Param('userId') userId: string
  ) {
    return this.folderService.findFoldersByUserId(userId).then((data) => {
      return plainToInstance(FolderOutputDto, data);
    });
  }

  @Get('/:userId/:folderId')
  async findOneById(
    @Param('userId') userId: string,
    @Param('folderId') folderId: string,
  ) {
    return this.folderService.findFolderById(userId, folderId);
  }

}
