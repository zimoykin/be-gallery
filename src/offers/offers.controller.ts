import { Body, Controller, Delete, Get, Logger, Param, Post, Put } from '@nestjs/common';
import { OffersService } from './offers.service';
import { Profile } from 'src/decorators/cookie.decorator';
import { IProfileCookie } from 'src/middlewares/profile-cookie.interface';
import { UserAccess } from '@zimoykin/auth';
import { OfferInputDto } from './dtos/offer-input.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { OfferOutputDto } from './dtos/offer-output.dto';
import { plainToInstance } from 'class-transformer';

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
        @Profile() profile: IProfileCookie
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
        @Profile() profile: IProfileCookie,
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
        @Profile() profile: IProfileCookie,
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
        @Profile() profile: IProfileCookie,
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
