import { Controller, Get, Logger, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ProfileService } from "./profile.service";
import { plainToInstance } from "class-transformer";
import { ProfileOutputDto } from "./dtos/profile-output.dto";


@ApiTags('Public')
@Controller('api/v1/public/profiles')
export class PublicProfileController {
    private readonly logger = new Logger(PublicProfileController.name);
    constructor(
        private readonly profileService: ProfileService,
    ) { }


    @Get()
    async getProfile() {
        return this.profileService.readAllPublicProfiles().then((data) => {
            return data.map((profile) => plainToInstance(ProfileOutputDto, profile));
        });
    }

    @Get(':id')
    async getProfileById(
        @Param('id') id: string,
    ) {
        return this.profileService.findProfileById(id).then((data) => {
            return plainToInstance(ProfileOutputDto, data);
        });
    }
}
