import { Injectable, Logger } from "@nestjs/common";
import { Offer } from "./offer.model";
import { Model, PipelineStage, QueryOptions } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class OfferRepository {
    private readonly logger = new Logger(OfferRepository.name);
    constructor(
        // @ts-ignore
        @InjectModel(Offer.name) private readonly offerModel: Model<Offer>,
    ) { }

    /**
     * Finds an offer by its ID.
     * @param id The ID of the offer to find.
     * @returns The found offer document as a plain object.
     */
    async findById(id: string) {
        return this.offerModel.findById(id).lean();
    }
    /**
     * Finds all offers that match the given filter.
     * @param filter The MongoDB query filter. If not given, finds all offers.
     * @returns The found offer documents as plain objects.
     */
    async find(filter?: QueryOptions<Offer>) {
        return this.offerModel.find({ ...filter }).lean();
    }

    /**
     * Finds all offers within a certain distance from a given location.
     * @param latitude The latitude of the location to search around.
     * @param longitude The longitude of the location to search around.
     * @param radius The maximum distance from the location to search up to, in meters.
     * @returns The found offer documents as plain objects, sorted by increasing distance.
     */
    async findByCoords(latitude: number, longitude: number, radius: number) {
        const aggregatePipeline: PipelineStage[] = [
            {
                $geoNear: {
                    near: {
                        "type": "Point",
                        "coordinates": [longitude, latitude]
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
            },
            {
                $sort: {
                    distance: 1
                }
            },
            {
                $limit: 20
            }
        ];
        return this.offerModel.aggregate<Offer>(aggregatePipeline);
    }

    /**
     * Find one offer document by filter.
     * @param filter The filter to query the database with. If omitted, returns null.
     * @returns The offer document as a plain object, or null if no document was found.
     */
    async findOne(filter?: Partial<Offer>) {
        if (!filter) return null;
        return this.offerModel.findOne(filter).lean();
    }

    /**
     * Creates a new offer document in the database.
     * Logs the creation process and transforms the location coordinates into a GeoJSON point if location data is provided.
     *
     * @param data - The partial data of the offer to be created, which may include a location with latitude and longitude.
     * @returns A promise that resolves to the newly created offer document.
     */
    async create(data: Partial<Offer>) {
        this.logger.debug(`create ${JSON.stringify(data)}`);
        // we list the longitude first, and then latitude.
        if (data.location?.lat && data.location?.long) {
            data.location.point = {
                type: "Point",
                coordinates: [data.location.long, data.location.lat],
            };
        }
        return this.offerModel.create(data);
    }

    /**
     * Updates an existing offer document by its ID with the specified fields to set or unset.
     *
     * @param id - The ID of the offer to update.
     * @param set - An object containing the fields and values to be updated in the offer.
     * @param unset - An optional array of field names to be removed from the offer: because mongo ignores undefined values.
     * @returns A promise that resolves to the updated offer document as a plain object.
     */
    async update(id: string, set: Partial<Offer>, unset?: (keyof Offer)[]) {
        this.logger.debug(`update ${id} ${JSON.stringify(set)}`);
        const updateRequest: Record<string, any> = { $set: { ...set } };
        if (unset) {
            updateRequest.$unset = {};
            unset.forEach((key) => {
                updateRequest.$unset[key] = 1;
            });
        }

        if (set.location?.lat && set.location?.long) {
            updateRequest.$set.location = {
                ...set.location,
                point: {
                    type: "Point",
                    coordinates: [set.location.long, set.location.lat]
                }
            };
        }
        return this.offerModel.findByIdAndUpdate(id, updateRequest, { new: true }).lean();
    }

    /**
     * Removes an offer document by its ID.
     * @param id The ID of the offer to remove.
     * @returns A promise that resolves to the removed offer document as a plain object.
     */
    async remove(id: string) {
        this.logger.debug(`remove ${id}`);
        return this.offerModel.remove(id);
    }
}