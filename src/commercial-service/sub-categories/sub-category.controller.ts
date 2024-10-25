import { Body, Controller, Delete, Get, Logger, Param, Post, Put } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AdminAccess } from "@zimoykin/auth";
import { SubCategoryService } from "./sub-category.service";
import { SubCategory } from "src/libs/models/sub-categories/sub-category.model";
import { SubCategoryInputDto } from "./dtos/sub-category-input.dto";

@ApiBearerAuth('Authorization')
@AdminAccess()
@ApiTags('Com')
@Controller('api/v1/com/sub-categories')
export class SubCategoryController {
    private readonly logger = new Logger(SubCategoryController.name);

    constructor(
        private readonly service: SubCategoryService
    ) { }


    @Get()
    async findAll() {
        this.logger.debug('findAll');
        return this.service.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        this.logger.debug('findOne');
        return this.service.findById(id);
    }

    @Get('name/:name')
    async findByName(@Param('name') name: string) {
        this.logger.debug('findByName');
        return this.service.findByName(name);
    }

    @Post()
    async create(
        @Body() data: SubCategoryInputDto
    ) {
        this.logger.debug('create');
        return this.service.create(data);
    }

    @Put(':id')
    async update(@Param('id') id: string, data: Partial<SubCategory>) {
        this.logger.debug('update');
        return this.service.update(id, data);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        this.logger.debug('delete');
        return this.service.delete(id);
    }

}