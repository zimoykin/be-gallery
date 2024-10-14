import { Injectable, Logger } from "@nestjs/common";
import { DynamoDbRepository, InjectRepository, IScanFilter } from "../../../libs/dynamo-db";
import { Offer } from "./offer.model";

@Injectable()
export class OfferRepository {
    private readonly logger = new Logger(OfferRepository.name);
    constructor(
        @InjectRepository(Offer) private readonly offerModel: DynamoDbRepository<Offer>,
    ) { }

    async findById(id: string) {
        return this.offerModel.findById(id);
    }
    async find(filter?: IScanFilter<Offer>) {
        return this.offerModel.find(filter);
    }

    async findOne(filter?: IScanFilter<Offer>) {
        if (!filter) return null;
        return this.offerModel.findOneByFilter(filter);
    }

    async create(data: Partial<Offer>) {
        this.logger.debug(`create ${JSON.stringify(data)}`);
        return this.offerModel.create(data);
    }

    async update(id: string, data: Partial<Offer>) {
        this.logger.debug(`update ${id} ${JSON.stringify(data)}`);
        return this.offerModel.update(id, data);
    }

    async remove(id: string) {
        this.logger.debug(`remove ${id}`);
        return this.offerModel.remove(id);
    }
}