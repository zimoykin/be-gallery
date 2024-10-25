import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Profile } from "./models/profile.model";
import { InjectModel } from "@nestjs/mongoose";
import { Model, PipelineStage } from "mongoose";
import { gte } from "lodash";
import { GeoSearchDto } from "src/profile-service/profiles/dtos/geo-search.dto";

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
        // we list the longitude first, and then latitude.
        if (data.location?.lat && data.location?.long) {
            data.location.point = {
                type: "Point",
                coordinates: [data.location.long, data.location.lat],
            };
        }
        const createdId = await this.profileModel.create(data);
        return createdId;
    }

    async update(id: string, data: Partial<Profile>) {
        if (data.location?.lat && data.location?.long) {
            data.location.point = {
                type: "Point",
                coordinates: [data.location.long, data.location.lat],
            };
        }
        return this.profileModel.findOneAndUpdate({ _id: id }, { $set: { ...data } }, { returnDocument: 'after' }).lean();
    }


    async geoSearch(filter: GeoSearchDto) {
        const { lat, lng, radius, categories } = filter;
        const categoriesFilter = categories?.length ? {
            $or: [
                {
                    categories: { $in: categories }
                },
                {
                    categories: { $size: 0 }
                }
            ]
        } : undefined;
        const aggregatePipeline: PipelineStage[] = [
            {
                $geoNear: {
                    near: {
                        "type": "Point",
                        "coordinates": [lng, lat]
                    },
                    "distanceField": "distance",
                    "distanceMultiplier": 0.001,
                    "maxDistance": 1000000,
                    "spherical": true
                }
            },
            {
                $addFields: {
                    "total_distance": {
                        "$subtract": [{ "$subtract": ["$distance", "$location.distance"] }, radius]
                    }
                }
            },
            {
                $match: {
                    total_distance: { $lte: 0 },
                }
            }
        ];
        if (categoriesFilter) {
            aggregatePipeline.push({
                $match: {
                    ...categoriesFilter
                }
            });
        }

        aggregatePipeline.push({
            $sort: {
                distance: 1
            }
        });

        const results = await this.profileModel.aggregate(aggregatePipeline);
        return results;
    }

}