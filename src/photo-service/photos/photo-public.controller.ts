import { Controller, Get, Logger, Param } from '@nestjs/common';
import { PublicPhotoService } from './public-photo.service';
import { PublicPhotoOutputDto } from './dtos/public-photo-output-dto';
import { plainToInstance } from 'class-transformer';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('Public')
@Controller('api/v1/public/photos')
export class PhotoPublicController {
  private readonly logger = new Logger(PhotoPublicController.name);
  constructor(
    private readonly publicPhotoService: PublicPhotoService
  ) { }
  
  @Get('favourite')
  async getFavouritePhotos(): Promise<PublicPhotoOutputDto[]> {
    return this.publicPhotoService.getFavouritePhotos().then((photos) => plainToInstance(PublicPhotoOutputDto, photos))
      .catch((err) => {
        this.logger.error(err);
        throw err;
      });
  }

  @Get(':profileId/:folderId')
  async getUsersPhotosByFolderId(
    @Param('profileId') profileId: string,
    @Param('folderId') folderId: string,
  ): Promise<PublicPhotoOutputDto[]> {
    return this.publicPhotoService
      .getUsersPhotosByFolderIdAndProfileId(profileId, folderId)
      .then((photos) =>
        photos.map((photo) => plainToInstance(PublicPhotoOutputDto, photo)),
      )
      .catch((err) => {
        this.logger.error(err);
        throw err;
      });
  }
}
