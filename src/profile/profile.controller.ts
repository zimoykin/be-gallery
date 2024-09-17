import { Body, Controller, Get, Logger, Put, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthUser, IAuthUser, UserAccess } from '@zimoykin/auth';
import { ProfileService } from './profile.service';
import { ProfileInDto } from './dtos/profile-in.dto';
import { ProfileOutputDto } from './dtos/profile-out.dto';
import { plainToInstance } from 'class-transformer';

@ApiBearerAuth('Authorization')
@UserAccess()
@Controller('api/v1/profiles')
export class ProfileController {
    private readonly logger = new Logger(ProfileController.name);
    constructor(
        private readonly profileService: ProfileService,
    ) { }


    @Get()
    async getProfile(
        // @Query('location') location: string,
    ) {
        return this.profileService.readAllPublicProfiles().then((data) => {
            return plainToInstance(ProfileOutputDto, data);
        });
    }

    @Put()
    async updateProfile(
        @AuthUser() user: IAuthUser,
        @Body() dto: ProfileInDto
    ) {
        return this.profileService.updateProfile(user.id, dto);
    }
}
