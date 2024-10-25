import { ConflictException, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { SubCategory } from "./sub-category.model";
import { Model } from "mongoose";

@Injectable()
export class SubCategoryRepository {
    private readonly logger = new Logger(SubCategoryRepository.name);
    constructor(
        // @ts-ignore
        @InjectModel(SubCategory.name) private readonly subCategoryModel: Model<SubCategory>,
    ) { }


    async findAll(): Promise<SubCategory[]> {
        return this.subCategoryModel.find().lean();
    }

    async findById(id: string): Promise<SubCategory> {
        return this.subCategoryModel.findById(id).lean();
    }

    async findByName(name: string): Promise<SubCategory> {
        return this.subCategoryModel.findOne({ name }).lean();
    }

    async create(data: Partial<SubCategory>) {
        this.logger.debug(`create ${JSON.stringify(data)}`);
        const createdId = await this.subCategoryModel.create(data)
            .catch((err) => {
                this.logger.error(err);
                if (err?.code === 11000) {
                    throw new ConflictException('SubCategory already exists');
                } else throw new InternalServerErrorException();
            });
        return createdId;
    }

    async update(id: string, data: Partial<SubCategory>) {
        this.logger.debug(`update ${id} ${JSON.stringify(data)}`);
        return this.subCategoryModel.findOneAndUpdate({ _id: id }, { $set: { ...data } }, { new: true }).lean();
    }

    async delete(id: string) {
        this.logger.debug(`delete ${id}`);
        return this.subCategoryModel.findByIdAndDelete(id).lean();
    }
}