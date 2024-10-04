import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Post,
  Put,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthUser, IAuthUser, UserAccess } from '@zimoykin/auth';
import { plainToInstance } from 'class-transformer';
import { Response } from 'express';
import { ProfileService } from './profile.service';
import { ProfileInDto } from './dtos/profile-input.dto';
import { ProfileOutputDto } from './dtos/profile-output.dto';
import { IProfileCookie } from '../middlewares/profile-cookie.interface';
import { cookieProfileAuth } from '../middlewares/profile-auth.middleware';
import { Profile } from '../decorators/cookie.decorator';
import { IProfile } from './interfaces/profile.interface';

@ApiBearerAuth('Authorization')
@UserAccess()
@Controller('api/v1/profiles')
export class ProfileController {
  private readonly logger = new Logger(ProfileController.name);
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  @HttpCode(200)
  async getProfileByUserId(
    @Profile() profile: IProfileCookie,
    @Res() res: Response,
  ) {
    return this.profileService
      .findProfileById(profile.profileId)
      .then((data) => {
        const profile = plainToInstance(ProfileOutputDto, data);
        return res.send(profile);
      })
      .catch((error) => {
        this.logger.error(error);
        // just a case clear cookie
        res.clearCookie(cookieProfileAuth);
        throw error;
      });
  }

  @Get()
  @HttpCode(200)
  async getProfile() {
    return this.profileService.readAllPublicProfiles().then((data) => {
      return plainToInstance(ProfileOutputDto, data);
    });
  }

  @Post('/photo/upload')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 1024 * 1024 * 10 } }),
  )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async createProfilePhoto(
    @Profile() profile: IProfileCookie,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.profileService.createProfilePhoto(profile.profileId, file);
  }

  @Put()
  @HttpCode(200)
  async updateProfile(
    @Profile() profile: IProfileCookie,
    @Body() dto: ProfileInDto,
  ) {
    return this.profileService
      .updateProfile(profile.profileId, dto)
      .then((data) => {
        return plainToInstance(ProfileOutputDto, data);
      })
      .catch((error) => {
        this.logger.error(error);
        throw error;
      });
  }

  @Post('/logout')
  @HttpCode(200)
  async logout(@Res() res: Response) {
    res.clearCookie(cookieProfileAuth);
    return res.send('ok');
  }

  @Post('/login')
  @HttpCode(200)
  async login(
    @AuthUser() authUser: IAuthUser,
    @Profile() profileCookie: IProfileCookie,
    @Res() res: Response,
  ) {
    res.clearCookie(cookieProfileAuth);
    let profile: IProfile;
    try {
      profile =
        (await this.profileService.findProfileByUserId(authUser.id)) ||
        (await this.profileService.createProfile(
          authUser.id,
          authUser.email?.split('@')[0] ?? 'unknown',
        ));
    } catch (error) {
      profile = await this.profileService.createProfile(
        authUser.id,
        authUser.email ?? 'unknown',
      );
    }

    if (!profile) {
      this.logger.error('Profile not found and can not be created');
      return res.sendStatus(400);
    }

    const profileCookieData = JSON.stringify({
      profileId: profile.id,
      userId: authUser.id,
    });
    this.logger.debug('Profile cookie data:', profileCookieData);
    res.cookie(cookieProfileAuth, profileCookieData, {
      httpOnly: true,
      signed: true,
      sameSite: 'none',
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    });
    return res.send('ok');
  }
}
