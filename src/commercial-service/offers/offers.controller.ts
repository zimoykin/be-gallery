import { Body, Controller, Delete, Get, Logger, Param, Post, Put } from '@nestjs/common';
import { OffersService } from './offers.service';
import { UserAccess } from '@zimoykin/auth';
import { OfferInputDto } from './dtos/offer-input.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { OfferOutputDto } from './dtos/offer-output.dto';
import { plainToInstance } from 'class-transformer';
import { IProfileCookie, ProfileCookie } from '../../libs/profile-cookie';

@Controller('api/v1/offers')
@ApiBearerAuth("Authorization")
@UserAccess()
export class OffersController {
    private readonly logger = new Logger(OffersController.name);

    constructor(
        private readonly service: OffersService
    ) { }

    @Get()
    async getAllOffersByProfileId(
        @ProfileCookie() profile: IProfileCookie
    ): Promise<OfferOutputDto[]> {
        return this.service.getAllOffersByProfileId(profile.profileId).then((res) => {
            return plainToInstance(OfferOutputDto, res);
        }).catch((err) => {
            this.logger.error(err);
            throw err;
        });
    }

    @Post()
    async createOffer(
        @ProfileCookie() profile: IProfileCookie,
        @Body() data: OfferInputDto
    ): Promise<OfferOutputDto> {
        return this.service.createOffer(profile.profileId, data).then((res) => {
            return plainToInstance(OfferOutputDto, res);
        }).catch((err) => {
            this.logger.error(err);
            throw err;
        });
    }

    @Put(':id')
    async updateOffer(
        @ProfileCookie() profile: IProfileCookie,
        @Param() id: string,
        @Body() data: OfferInputDto
    ): Promise<OfferOutputDto> {
        return this.service.updateOffer(profile.profileId, id, data).then((res) => {
            return plainToInstance(OfferOutputDto, res);
        }).catch((err) => {
            this.logger.error(err);
            throw err;
        });
    }

    @Delete(':id')
    async deleteOffer(
        @ProfileCookie() profile: IProfileCookie,
        @Param() id: string
    ): Promise<OfferOutputDto> {
        return this.service.deleteOffer(profile.profileId, id).then((res) => {
            return plainToInstance(OfferOutputDto, res);
        }).catch((err) => {
            this.logger.error(err);
            throw err;
        });
    }

}
