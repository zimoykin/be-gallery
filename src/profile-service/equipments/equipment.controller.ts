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
import { plainToInstance } from 'class-transformer';
import { EquipmentInputDto } from './dtos/equipment-input.dto';
import { UserAccess } from '@zimoykin/auth';
import { ApiBearerAuth } from '@nestjs/swagger';
import { EquipmentService } from './equipment.service';
import { EquipmentOutputDto } from './dtos/equipment-output.dto';
import { IProfileCookie, ProfileCookie } from '../../libs/profile-cookie';

@Controller('api/v1/equipments')
@UserAccess()
@ApiBearerAuth('Authorization')
export class EquipmentController {
  private readonly logger = new Logger(EquipmentController.name);

  constructor(private readonly equipmentService: EquipmentService) {}

  @Get()
  @HttpCode(200)
  async getEquipment(@ProfileCookie() profile: IProfileCookie) {
    return this.equipmentService
      .findEquipmentProfileById(profile.profileId)
      .then((data) => {
        return data.map((_) => plainToInstance(EquipmentOutputDto, _));
      })
      .catch((error) => {
        this.logger.error(error);
        throw error;
      });
  }

  @Put(':id')
  @HttpCode(200)
  async updateEquipment(
    @ProfileCookie() profile: IProfileCookie,
    @Body() dto: EquipmentInputDto,
    @Param('id') id: string,
  ) {
    return this.equipmentService
      .updateEquipment(profile.profileId, id, dto)
      .then((data) => {
        return plainToInstance(EquipmentOutputDto, data);
      })
      .catch((error) => {
        this.logger.error(error);
        throw error;
      });
  }

  @Post()
  @HttpCode(200)
  async appendEquipment(
    @ProfileCookie() profile: IProfileCookie,
    @Body() dto: EquipmentInputDto,
  ) {
    return this.equipmentService
      .appendEquipment(profile.profileId, dto)
      .then((data) => {
        return plainToInstance(EquipmentOutputDto, data);
      })
      .catch((error) => {
        this.logger.error(error);
        throw error;
      });
  }

  @Delete(':id')
  @HttpCode(200)
  async updateProfilePhoto(
    @ProfileCookie() profile: IProfileCookie,
    @Param('id') id: string,
  ) {
    return this.equipmentService
      .removeEquipment(id, profile.profileId)
      .then((data) => {
        return plainToInstance(EquipmentOutputDto, data);
      })
      .catch((error) => {
        this.logger.error(error);
        throw error;
      });
  }
}
