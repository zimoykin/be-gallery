import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { DynamoDbRepository, InjectRepository, IScanFilter } from "../../../libs/dynamo-db";
import { Profile } from "../models/profile.model";

@Injectable()
export class ProfileRepository {
    private readonly logger = new Logger(ProfileRepository.name);
    constructor(
        @InjectRepository(Profile) private readonly profileModel: DynamoDbRepository<Profile>
    ) { }


    async find(filter: IScanFilter<Profile>) {
        return this.profileModel.find(filter);
    }
    async findById(id: string) {
        const profile = await this.profileModel.findById(id);
        if (!profile) {
            throw new NotFoundException();
        }
        return profile;
    }

    async findPublicProfiles() {
        const profiles = await this.profileModel.find(
            {
                match: { privateAccess: 0 },
            },
            'privateAccess',
        );

        return profiles;
    }

    async findOne(filter: IScanFilter<Profile>) {
        const data = await this.profileModel.findOneByFilter(filter);
        if (!data) {
            throw new NotFoundException();
        }
        return data;
    }

    async create(data: Partial<Profile>) {
        const createdId = await this.profileModel.create(data);
        return createdId;
    }

    async update(id: string, data: Partial<Profile>) {
        return this.profileModel.update(id, data);
    }
}