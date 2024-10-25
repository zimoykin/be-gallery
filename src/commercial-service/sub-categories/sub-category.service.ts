import { Injectable, Logger } from "@nestjs/common";
import { SubCategory } from "../../libs/models/sub-categories/sub-category.model";
import { SubCategoryRepository } from "../../libs/models/sub-categories/sub-category.repository";

@Injectable()
export class SubCategoryService {
    private readonly logger = new Logger(SubCategoryService.name);
    constructor(
        private readonly repository: SubCategoryRepository
    ) { }

    async findAll(): Promise<SubCategory[]> {
        return this.repository.findAll();
    }

    async findById(id: string): Promise<SubCategory> {
        return this.repository.findById(id);
    }

    async findByName(name: string): Promise<SubCategory> {
        return this.repository.findByName(name);
    }

    async create(data: Partial<SubCategory>) {
        this.logger.debug(`create ${JSON.stringify(data)}`);
        const createdId = await this.repository.create(data);
        return createdId;
    }

    async update(id: string, data: Partial<SubCategory>) {
        this.logger.debug(`update ${id} ${JSON.stringify(data)}`);
        return this.repository.update(id, data);
    }

    async delete(id: string) {
        this.logger.debug(`delete ${id}`);
        return this.repository.delete(id);
    }
}