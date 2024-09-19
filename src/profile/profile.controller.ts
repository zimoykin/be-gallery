import { Body, Controller, Get, Logger, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { AuthUser, IAuthUser, UserAccess } from '@zimoykin/auth';
import { ProfileService } from './profile.service';
import { ProfileInDto } from './dtos/profile-input.dto';
import { ProfileOutputDto } from './dtos/profile-output.dto';
import { plainToInstance } from 'class-transformer';
import { FileInterceptor } from '@nestjs/platform-express';
import { Profile } from 'src/middlewares/decorators/cookie.decorator';

@ApiBearerAuth('Authorization')
@UserAccess()
@Controller('api/v1/profiles')
export class ProfileController {
    private readonly logger = new Logger(ProfileController.name);
    constructor(
        private readonly profileService: ProfileService,
    ) { }


    @Get('me')
    async getProfileByUserId(
        @AuthUser() user: IAuthUser,
        @Profile() profileId: string,
    ) {
        return this.profileService.findProfileById(profileId).then((data) => {
            return plainToInstance(ProfileOutputDto, data);
        });
    }

    @Get()
    async getProfile() {
        return this.profileService.readAllPublicProfiles().then((data) => {
            return plainToInstance(ProfileOutputDto, data);
        });
    }

    @Post('/photo/upload')
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
        @AuthUser() user: IAuthUser,
        @UploadedFile() file: File,
    ) {
        return this.profileService.createProfilePhoto(
            user.id,
            file,
        );
    }

    @Put()
    async updateProfile(
        @AuthUser() user: IAuthUser,
        @Body() dto: ProfileInDto
    ) {
        return this.profileService.updateProfile(user.id, dto);
    }
}
