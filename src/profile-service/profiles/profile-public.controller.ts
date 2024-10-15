import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { plainToInstance } from 'class-transformer';
import { ProfileOutputDto } from './dtos/profile-output.dto';
import { GeoSearchDto } from './dtos/geo-search.dto';

@ApiTags('Public')
@Controller('api/v1/public/profiles')
export class PublicProfileController {
  private readonly logger = new Logger(PublicProfileController.name);
  constructor(private readonly profileService: ProfileService) { }

  @Get()
  async getProfile() {
    return this.profileService.readAllPublicProfiles().then((data) => {
      return data.map((profile) => plainToInstance(ProfileOutputDto, profile));
    });
  }

  @Post('/geo-search')
  async geoSearch(
    @Body() dto: GeoSearchDto
  ) {
    return this.profileService.geoSearch(dto).then((data) => {
      return plainToInstance(ProfileOutputDto, data);
    });
  }

  @Get(':id')
  async getProfileById(@Param('id') id: string) {
    return this.profileService.findProfileById(id).then((data) => {
      return plainToInstance(ProfileOutputDto, data);
    });
  }
}
