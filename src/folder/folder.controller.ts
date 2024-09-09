import { Body, Controller, Delete, Get, Logger, NotImplementedException, Param, Post, Put } from '@nestjs/common';
import { FolderService } from './folder.service';
import { FolderInputDto } from './dtos/folder-input.dto';
import { AuthUser, IAuthUser, UserAccess } from '@zimoykin/auth';
import { ApiBearerAuth } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { FolderOutputDto } from './dtos/folder-output.dto';

@UserAccess()
@ApiBearerAuth('Authorization')
@Controller('api/v1/folders')
export class FolderController {
    private readonly logger = new Logger(FolderController.name);
    constructor(
        private readonly folderService: FolderService
    ) { }

    @Get()
    async findAll(
        @AuthUser() user: IAuthUser
    ) {
        return this.folderService.findAllByUserId(user.id).then(data => {
            return plainToInstance(FolderOutputDto, data);
        });
    }

    @Get(':id')
    async findOneById(
        @AuthUser() user: IAuthUser,
        @Param('id') id: string
    ) {
        return this.folderService.findUserFolderById(id, user.id);
    }

    @Post()
    async create(
        @AuthUser() user: IAuthUser,
        @Body() data: FolderInputDto
    ) {
        return this.folderService.createFolder({ ...data, userId: user.id }).then(data => {
            return plainToInstance(FolderOutputDto, data);
        });
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @AuthUser() user: IAuthUser,
        @Body() data: FolderInputDto
    ): Promise<FolderOutputDto> {
        return this.folderService.updateFolder(id, data, user.id).then(data => {
            return plainToInstance(FolderOutputDto, data);
        });
    }

    @Delete(':id')
    async delete(
        @Param('id') id: string,
        @AuthUser() user: IAuthUser
    ) {
        return this.folderService.removeFolder(id, user.id).then(data => {
            return plainToInstance(FolderOutputDto, data);
        });
    }
}
