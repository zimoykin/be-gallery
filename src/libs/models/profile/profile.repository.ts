import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Profile } from "./profile.model";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class ProfileRepository {
    private readonly logger = new Logger(ProfileRepository.name);
    constructor(
        // @ts-ignore
        @InjectModel(Profile.name) private readonly profileModel: Model<Profile>,
    ) { }

    async find(filter: Partial<Profile>) {
        return this.profileModel.find(filter);
    }
    async findById(id: string) {
        const profile = await this.profileModel.findById(id).lean();
        if (!profile) {
            throw new NotFoundException();
        }
        return profile;
    }

    async findByIds(ids: string[]) {
        return this.profileModel
            .find({ _id: { $in: ids } }).lean();
    }

    async findPublicProfiles() {
        const profiles = await this.profileModel.find(
            { privateAccess: false },
        ).lean();

        return profiles;
    }

    async findOne(filter: Partial<Profile>) {
        const data = await this.profileModel.findOne(filter).lean();
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
        return this.profileModel.findOneAndUpdate({ _id: id }, data).lean();
    }
}