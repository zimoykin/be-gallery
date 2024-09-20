import { Body, Controller, Get, HttpCode, Logger, Post, Put, Query, Redirect, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { AuthUser, IAuthUser, UserAccess } from '@zimoykin/auth';
import { ProfileService } from './profile.service';
import { ProfileInDto } from './dtos/profile-input.dto';
import { ProfileOutputDto } from './dtos/profile-output.dto';
import { plainToInstance } from 'class-transformer';
import { FileInterceptor } from '@nestjs/platform-express';
import { IProfileCookie } from 'src/middlewares/profile-cookie.interface';
import { Response } from 'express';
import { cookieProfileAuth } from 'src/middlewares/profile-auth.middleware';
import { Profile } from 'src/decorators/cookie.decorator';

@ApiBearerAuth('Authorization')
@UserAccess()
@Controller('api/v1/profiles')
export class ProfileController {
    private readonly logger = new Logger(ProfileController.name);
    constructor(
        private readonly profileService: ProfileService,
    ) { }


    @Get('me')
    @HttpCode(200)
    async getProfileByUserId(
        @Profile() profile: IProfileCookie,
        @Res() res: Response
    ) {
        return this.profileService.findProfileById(profile.profileId).then((data) => {
            return plainToInstance(ProfileOutputDto, data);
        }).catch((error) => {
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
        @UploadedFile() file: File,
    ) {
        return this.profileService.createProfilePhoto(
            profile.profileId,
            file,
        );
    }

    @Put()
    @HttpCode(200)
    async updateProfile(
        @Profile() profile: IProfileCookie,
        @Body() dto: ProfileInDto
    ) {
        return this.profileService.updateProfile(profile.profileId, dto);
    }


    @Post('/logout')
    @HttpCode(200)
    async logout(
        @Res() res: Response
    ) {
        res.clearCookie(cookieProfileAuth);
        return res.send('ok');
    }

    @Post('/login')
    @HttpCode(200)
    async login(
        @AuthUser() authUser: IAuthUser,
        @Res() res: Response
    ) {
        res.clearCookie(cookieProfileAuth);
        return res.redirect('/api/v1/profiles/me');
    }

}
