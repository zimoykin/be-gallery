import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { FolderService } from './folder.service';
import { FolderInputDto } from './dtos/folder-input.dto';

@Controller('api/v1/folder')
export class FolderController {
    private readonly logger = new Logger(FolderController.name);
    constructor(
        private readonly folderService: FolderService
    ) { }

    @Get()
    async findAll() {
        return this.folderService.findAll();
    }

    @Post()
    async create(
        @Body() data: FolderInputDto
    ) {
        return this.folderService.create(data);
    }
}
