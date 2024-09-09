import { Body, Controller, Delete, Get, Logger, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { PhotoService } from './photo.service';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { AuthUser, IAuthUser, UserAccess } from '@zimoykin/auth';
import { PhotoInputDto } from './dtos/photo-input.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@ApiBearerAuth("Authorization")
@UserAccess()
@Controller('api/v1/photos')
export class PhotoController {
    private readonly logger = new Logger(PhotoController.name);
    constructor(private readonly photoService: PhotoService) { }


    @Get(':folderId')
    async getPhotoByFolderId(
        @Param('folderId') folderId: string,
        @AuthUser() user: IAuthUser
    ) {
        const photos = await this.photoService.getPhotosByFolderId(folderId, user.id);
        return photos;
    }

    @Get(':folderId/:photoId')
    async getSpecificPhotoByIdByFolderId(
        @Param('folderId') folderId: string,
        @Param('photoId') photoId: string,
        @AuthUser() user: IAuthUser
    ) {
        return this.photoService.getSpecificPhotoByIdByFolderId(folderId, user.id, photoId);
    }

    @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 1024 * 1024 * 10 } }))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                sortOrder: { type: 'number', example: 0 },
                camera: { type: 'string', example: 'Canon EOS 650' },
                lens: { type: 'string', example: 'EF-35-8-mm f/4-5.6 USM' },
                iso: { type: 'string', example: '200' },
                film: { type: 'string', example: 'Kodak color plus 200 35mm' },
                location: { type: 'string', example: 'Regensburg, Germany' },
                description: { type: 'string', example: '2024' },
            },
        },
    })
    @Post(':folderId')
    async uploadImg(
        @Param('folderId') folderId: string,
        @Body() data: PhotoInputDto,
        @AuthUser() user: IAuthUser,
        @UploadedFile() file: File
    ) {
        try {
            const photoData = plainToInstance(PhotoInputDto, data);
            await validate(photoData);
            return this.photoService.createPhotoObject(folderId, user.id, photoData, file);
        } catch (error) {
            this.logger.debug(error);
            throw error;
        }
    }

    @Delete(':folderId/:photoId')
    async removePhoto(
        @Param('folderId') folderId: string,
        @Param('photoId') photoId: string,
        @AuthUser() user: IAuthUser
    ) {
        return this.photoService.removePhoto(folderId, user.id, photoId);
    }
}

