import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Offer } from './models/offer.model';
import { IOfferInput } from '../../libs/models/offer-input.interface';
import { DynamoDbRepository, InjectRepository } from "../../libs/dynamo-db";

@Injectable()
export class OffersService {
    private readonly logger = new Logger(OffersService.name);
    constructor(
        // @ts-ignore
        @InjectRepository(Offer) private repo: DynamoDbRepository<Offer>,
    ) { }


    async getOfferById(id: string): Promise<Offer | null> {
        return this.repo.findById(id);
    }

    async getAllOffers(): Promise<Offer[]> {
        return this.repo.find({
            match: {
                privateAccess: 0
            },
            gte: {
                availableUntil: new Date().getTime()
            },
            limit: 5
        });
    }
    async getAllOffersByProfileId(profileId: string): Promise<Offer[]> {
        return this.repo.find({
            match: {
                profileId: profileId
            }
        });
    }


    async createOffer(profileId: string, data: IOfferInput): Promise<Offer | null> {
        const id = await this.repo.create({ ...data, profileId: profileId });
        if (id) {
            return this.repo.findById(id);
        } else throw new BadRequestException('Offer not created');
    }

    async updateOffer(profileId: string, id: string, data: IOfferInput): Promise<Offer | null> {
        const offer = await this.repo.findOneByFilter({
            match: {
                id: id,
                profileId: profileId,
            }
        });
        if (!offer) {
            throw new NotFoundException('Offer not found');
        }
        await this.repo.update(id, { ...data });
        return this.repo.findById(id);
    }

    async deleteOffer(profileId: string, id: string) {
        const data = await this.repo.findOneByFilter({
            match: {
                id: id,
                profileId: profileId,
            }
        });

        if (!data) {
            throw new NotFoundException('Offer not found');
        }

        //TODO: checking offer twice, which is not good
        await this.repo.remove(id);
        return data;
    }

    async getOffersByProfileId(profileId: string): Promise<Offer[]> {
        return this.repo.find({
            match: { profileId: profileId },
        });
    }
}
