import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { DynamoDbRepository, InjectRepository, IScanFilter } from "../../../libs/dynamo-db";
import { Equipment } from "./equipment.model";
import { IEquipment } from "../eqiupment.interface";


@Injectable()
export class EquipmentRepository {
    private readonly logger = new Logger(EquipmentRepository.name);
    constructor(
        @InjectRepository(Equipment) private readonly equipRepository: DynamoDbRepository<Equipment>,
    ) { }

    async find(filter: IScanFilter<Equipment>) {
        const eqps = await this.equipRepository.find(filter);
        return eqps ?? [];
    }

    async findOne(filter: IScanFilter<Equipment>) {
        const eqps = await this.equipRepository.findOneByFilter(filter);
        if (!eqps) {
            throw new NotFoundException();
        }
        return eqps;
    }


    async findFavoriteEquipmentByProfileId(profileId: string) {
        const eqps = await this.equipRepository.find({
            match: { profileId: profileId, favorite: 1 },
        });
        return eqps ?? [];
    }

    async updateById(id: string, update: Equipment) {
        const result = await this.equipRepository.update(id, update);
        return result;
    }

    async updateAllByFilter(filter: IScanFilter<Equipment>, update: Partial<IEquipment>) {
        return this.equipRepository.updateByFilter(filter, update);
    }


    async countByProfileId(profileId: string) {
        const eqps = await this.equipRepository.countByFilter({
            match: { profileId: profileId },
        });

        return eqps ?? 0;
    }

    async create(data: Omit<Equipment, 'id'>) {
        const createdId = await this.equipRepository.create(data);
        return createdId;

    }

    async remove(id: string) {
        await this.equipRepository.remove(id);
        return true;
    }


}