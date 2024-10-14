import { Body, Controller, Delete, Get, HttpCode, Logger, Param, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { OffersService } from './offers.service';
import { UserAccess } from '@zimoykin/auth';
import { OfferInputDto } from './dtos/offer-input.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { OfferOutputDto } from './dtos/offer-output.dto';
import { plainToInstance } from 'class-transformer';
import { IProfileCookie, ProfileCookie } from '../../libs/profile-cookie';
import { FileInterceptor } from '@nestjs/platform-express';
import { title } from 'process';

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

    @ApiOperation({ summary: 'upload image' })
    @UseInterceptors(
        FileInterceptor('file', { limits: { fileSize: 1024 * 1024 * 10 } }),
    )
    @HttpCode(200)
    @HttpCode(400)
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                title: { type: 'string', example: 'Trip to Atlantida' },
                price: { type: 'number', example: 750 },
                text: { type: 'string', example: 'lorem ipsum....' },
                category: { type: 'string', example: 'trip' },
            },
        },
    })
    @Post()
    async createOffer(
        @ProfileCookie() profile: IProfileCookie,
        @Body() data: OfferInputDto,
        @UploadedFile() file: Express.Multer.File,
    ): Promise<OfferOutputDto> {
        if (!file) {
            throw new Error('File is not an image');
        }
        return this.service.createOffer(
            profile.profileId, { ...data, profileId: profile.profileId }, file).then((res) => {
                return plainToInstance(OfferOutputDto, res);
            }).catch((err) => {
                this.logger.error(err);
                throw err;
            });
    }

    @Post(':id/image')
    @ApiOperation({ summary: 'upload image' })
    @UseInterceptors(
        FileInterceptor('file', { limits: { fileSize: 1024 * 1024 * 10 } }),
    )
    @HttpCode(200)
    @HttpCode(400)
    @ApiConsumes('multipart/form-data')

    async uploadImage(
        @ProfileCookie() profile: IProfileCookie,
        @UploadedFile() file: Express.Multer.File,
        @Param('id') id: string,
    ) { 
        return this.service.updateImage(id, profile.profileId, file);
    }

    @Put(':id')
    async updateOffer(
        @ProfileCookie() profile: IProfileCookie,
        @Param('id') id: string,
        @Body() data: OfferInputDto
    ): Promise<OfferOutputDto> {
        return this.service.updateOffer(profile.profileId, id, { ...data, profileId: profile.profileId }).then((res) => {
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
