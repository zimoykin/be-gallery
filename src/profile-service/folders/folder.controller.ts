import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { FolderService } from './folder.service';
import { FolderInputDto } from './dtos/folder-input.dto';
import { AuthUser, IAuthUser, UserAccess } from '@zimoykin/auth';
import { ApiBearerAuth } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { FolderOutputDto } from './dtos/folder-output.dto';
import { IProfileCookie } from '../../libs/profile-cookie/middlewares/profile-cookie.interface';
import { FoldeWithTotalOutputDto } from './dtos/folder-with-total-output.dto';
import { ProfileCookie } from '../../libs/profile-cookie';

@UserAccess()
@ApiBearerAuth('Authorization')
@Controller('api/v1/folders')
export class FolderController {
  private readonly logger = new Logger(FolderController.name);
  constructor(private readonly folderService: FolderService) { }

  @Get()
  @HttpCode(200)
  async findAll(@ProfileCookie() profile: IProfileCookie) {
    return this.folderService
      .findAllByProfileId(profile.profileId)
      .then((data) => {
        return plainToInstance(FoldeWithTotalOutputDto, data);
      })
      .catch((error) => {
        this.logger.error(error);
        return [];
      });
  }

  @Get(':id')
  @HttpCode(200)
  async findOneById(
    @ProfileCookie() profile: IProfileCookie,
    @Param('id') id: string
  ) {
    return this.folderService.findFolderByIdAndProfileId(id, profile.profileId).then((data) => {
      return plainToInstance(FolderOutputDto, data);
    }).catch((error) => {
      this.logger.error(error);
      throw error;
    });
  }

  @Post()
  @HttpCode(200)
  async create(
    @ProfileCookie() profile: IProfileCookie,
    @Body() data: FolderInputDto,
  ) {
    return this.folderService
      .createFolder({ ...data }, profile.profileId)
      .then((data) => {
        return plainToInstance(FolderOutputDto, data);
      });
  }

  @Put(':id')
  @HttpCode(200)
  async update(
    @Param('id') id: string,
    @ProfileCookie() profile: IProfileCookie,
    @Body() data: FolderInputDto,
  ): Promise<FolderOutputDto> {
    return this.folderService.updateFolderByProfileId(id, data, profile.profileId).then((data) => {
      return plainToInstance(FolderOutputDto, data);
    });
  }

  @Delete(':id')
  @HttpCode(200)
  async delete(@Param('id') id: string, @AuthUser() user: IAuthUser) {
    return this.folderService.removeFolder(id, user.id).then((data) => {
      return plainToInstance(FolderOutputDto, data);
    });
  }
}
