import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { PhotoModel } from "./photo.model";
import { FilterQuery, Model } from "mongoose";

@Injectable()
export class PhotoRepository {
    private readonly logger = new Logger(PhotoRepository.name);
    constructor(
        // @ts-ignore
        @InjectModel(PhotoModel.name) private readonly photoModel: Model<PhotoModel>,
    ) { }

    async findById(id: string) {
        return this.photoModel.findById(id).lean();
    }
    async findByIds(ids: string[]) {
        return this.photoModel
            .find({ _id: { $in: ids } })
            .lean();
    }

    async findOne(filter: FilterQuery<PhotoModel>) {
        return this.photoModel
            .findOne({ ...filter })
            .lean();
    }

    async find(filter: Partial<PhotoModel>) {
        return this.photoModel
            .find({ ...filter })
            .lean();
    }

    async findRandomPublicPhotos(limit: number = 15) {
        const photos = await this.photoModel.aggregate<PhotoModel>([
            { $match: { privateAccess: 0 } },
            { $sample: { size: 15 } }
        ]);

        return photos ?? [];
    }

    async count(filter: Partial<PhotoModel>) {
        return this.photoModel
            .count({ ...filter }).lean();
    }

    async create(data: Partial<PhotoModel>) {
        return this.photoModel
            .create({ ...data });
    }

    async update(id: string, data: Partial<PhotoModel>) {
        return this.photoModel
            .findByIdAndUpdate({ _id: id }, {
                $set: { ...data }
            });
    }

    async remove(id: string) {
        return this.photoModel
            .findByIdAndDelete({ _id: id });
    }
}