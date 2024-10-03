import { Body, Controller, Delete, Get, HttpCode, Logger, Post } from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { Profile } from "src/decorators/cookie.decorator";
import { IProfileCookie } from "src/middlewares/profile-cookie.interface";
import { plainToInstance } from "class-transformer";
import { EquipmentDto } from "./dtos/equipment.dto";
import { UserAccess } from "@zimoykin/auth";
import { ApiBearerAuth } from "@nestjs/swagger";
import { ProfileEquipmentService } from "./profile-equipment.service";

@Controller('api/v1/profiles/equipments')
@UserAccess()
@ApiBearerAuth('Authorization')
export class ProfileEquipmentController {
    private readonly logger = new Logger(ProfileEquipmentController.name);

    constructor(
        private readonly profileEquipmentService: ProfileEquipmentService,
    ) { }

    @Get('/equipment')
    @HttpCode(200)
    async getEquipment(
        @Profile() profile: IProfileCookie
    ) {
        return this.profileEquipmentService.findEquipmentProfileById(profile.profileId)
            .then((data) => {
                return data.map((_) => plainToInstance(EquipmentDto, _));
            }).catch((error) => {
                this.logger.error(error);
                throw error;
            });
    }

    @Post('/equipment')
    @HttpCode(200)
    async appendEquipment(
        @Profile() profile: IProfileCookie,
        @Body() dto: EquipmentDto
    ) {
        return this.profileEquipmentService.appendEquipment(profile.profileId, dto)
            .then((data) => {
                return plainToInstance(EquipmentDto, data);
            }).catch((error) => {
                this.logger.error(error);
                throw error;
            });
    }
    @Delete('/equipment')
    @HttpCode(200)
    async updateProfilePhoto(
        @Profile() profile: IProfileCookie,
        @Body() dto: EquipmentDto
    ) {
        return this.profileEquipmentService.removeEquipment(profile.profileId, dto)
            .then((data) => {
                return plainToInstance(EquipmentDto, data);
            }).catch((error) => {
                this.logger.error(error);
                throw error;
            });
    }



}