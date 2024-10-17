import { Injectable, Logger } from "@nestjs/common";
import { Offer } from "./offer.model";
import { Model, QueryOptions } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class OfferRepository {
    private readonly logger = new Logger(OfferRepository.name);
    constructor(
        // @ts-ignore
        @InjectModel(Offer.name) private readonly offerModel: Model<Offer>,
    ) { }

    async findById(id: string) {
        return this.offerModel.findById(id);
    }
    async find(filter?: QueryOptions<Offer>) {
        return this.offerModel.find({ ...filter });
    }

    async findOne(filter?: Partial<Offer>) {
        if (!filter) return null;
        return this.offerModel.findOne(filter);
    }

    async create(data: Partial<Offer>) {
        this.logger.debug(`create ${JSON.stringify(data)}`);
        return this.offerModel.create(data);
    }

    async update(id: string, data: Partial<Offer>) {
        this.logger.debug(`update ${id} ${JSON.stringify(data)}`);
        return this.offerModel.findByIdAndUpdate(id, { $set: { ...data } });
    }

    async remove(id: string) {
        this.logger.debug(`remove ${id}`);
        return this.offerModel.remove(id);
    }
}