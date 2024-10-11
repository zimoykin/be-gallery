import { Controller, Get, Logger, Param } from '@nestjs/common';
import { OffersService } from './offers.service';
import { ApiTags } from '@nestjs/swagger';
import { OfferOutputDto } from './dtos/offer-output.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('Public')
@Controller('api/v1/public/offers')
export class OffersPublicController {
    private readonly logger = new Logger(OffersPublicController.name);

    constructor(
        private readonly service: OffersService
    ) { }

    @Get()
    async getOffersList(): Promise<OfferOutputDto[]> {
        return this.service.getAllOffers().then((res) => {
            return res.map((offer) => plainToInstance(OfferOutputDto, offer));
        }).catch((err) => {
            this.logger.error(err);
            throw err;
        });
    }

    @Get(':id')
    async getOfferById(
        @Param('id') id: string
    ): Promise<OfferOutputDto> {
        return this.service.getOfferById(id).then((res) => {
            return plainToInstance(OfferOutputDto, res);
        }).catch((err) => {
            this.logger.error(err);
            throw err;
        });
    }

}
