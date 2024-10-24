import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PhotoService } from './photo.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';
import { UserAccess } from '@zimoykin/auth';
import { PhotoInputDto } from './dtos/photo-input.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { PhotosParamDto } from './dtos/photos-param.dto';
import { PhotoOutputDto } from './dtos/photo-output.dto';
import { PhotoParamDto } from './dtos/photo-param.dto';
import { IProfileCookie, ProfileCookie } from 'src/libs/profile-cookie';

@ApiBearerAuth('Authorization')
@UserAccess()
@Controller('api/v1/photos')
export class PhotoController {
  private readonly logger = new Logger(PhotoController.name);
  constructor(
    private readonly photoService: PhotoService
  ) { }

  @Get(':folderId/:type')
  async getPhotoByFolderId(
    @Param() params: PhotosParamDto,
    @ProfileCookie() profile: IProfileCookie,
  ): Promise<PhotoOutputDto[]> {
    const photos = await this.photoService.getPhotosByFolderIdAndProfileId(
      params.folderId,
      params.type,
      profile.profileId,
    );
    return photos.map((photo) => plainToInstance(PhotoOutputDto, photo));
  }

  @Get(':folderId/:photoId/:type')
  async getPhotoById(
    @Param() param: PhotoParamDto,
    @ProfileCookie() profile: IProfileCookie,
  ) {
    return this.photoService
      .findPhotoById(
        param.photoId,
        profile.profileId,
        param.type
      )
      .then((photo) => plainToInstance(PhotoOutputDto, photo));
  }

  @ApiOperation({ summary: 'upload image' })
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 1024 * 1024 * 10 } }),
  )
  @HttpCode(200)
  @HttpCode(400)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        sortOrder: { type: 'number', example: 0 },
        camera: { type: 'string', example: 'Canon EOS 650' },
        lens: { type: 'string', example: 'EF-35-8-mm f/4-5.6 USM' },
        iso: { type: 'string', example: '200' },
        film: { type: 'string', example: 'Kodak color plus 200 35mm' },
        location: { type: 'string', example: 'Regensburg, Germany' },
        description: { type: 'string', example: '2024' },
      },
    },
  })
  @Post(':folderId')
  async uploadImg(
    @Param('folderId') folderId: string,
    @Body() data: PhotoInputDto,
    @ProfileCookie() profile: IProfileCookie,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.photoService
      .createPhotoObject(folderId, profile.profileId, data, file)
      .then((photo) => plainToInstance(PhotoOutputDto, photo))
      .catch((err) => {
        this.logger.error(err);
        throw err;
      });
  }

  @ApiOperation({ summary: 'set favourite' })
  @Patch(':folderId/:photoId')
  async setFavourite(
    @Param('folderId') folderId: string,
    @Param('photoId') photoId: string,
    @ProfileCookie() profile: IProfileCookie,
  ) {

    return this.photoService.setFavouriteValue(profile.profileId, folderId, photoId);

  }

  @Put(':folderId/:photoId')
  async updatePhoto(
    @Param('folderId') folderId: string,
    @Param('photoId') photoId: string,
    @Body() data: PhotoInputDto,
    @ProfileCookie() profile: IProfileCookie,
  ) {
    return this.photoService
      .updatePhoto(profile.profileId, folderId, photoId, data)
      .then((photo) => plainToInstance(PhotoOutputDto, photo));
  }

  @Delete(':folderId/:photoId')
  async removePhoto(
    @Param('folderId') folderId: string,
    @Param('photoId') photoId: string,
    @ProfileCookie() profile: IProfileCookie,
  ) {
    return this.photoService.removePhoto(folderId, profile.profileId, photoId);
  }

}
