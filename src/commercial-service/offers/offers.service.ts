import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IOfferInput } from '../../libs/models/offers/offer-input.interface';
import { OfferRepository } from '../../libs/models/offers/offer.repository';
import { Offer } from '../../libs/models/offers/offer.model';
import { InjectS3Bucket } from '../../libs/s3-bucket/inject-s3-bucket.decorator';
import { S3BucketService } from '../../libs/s3-bucket/s3-bucket.service';
import { ImageCompressorService } from '../../libs/image-compressor/image-compressor.service';

@Injectable()
export class OffersService {
    private readonly logger = new Logger(OffersService.name);
    constructor(
        private readonly offerRepository: OfferRepository,
        //@ts-ignore
        @InjectS3Bucket('offers-preview') private readonly s3BucketPreview: S3BucketService,
        //@ts-ignore
        @InjectS3Bucket('offers-compressed') private readonly s3BucketCompressed: S3BucketService,
        private readonly imageCompressorService: ImageCompressorService
    ) { }


    async getOfferById(id: string): Promise<Offer | null> {
        return this.offerRepository.findById(id);
    }

    async getAllOffers(): Promise<Offer[]> {
        return this.offerRepository.find({
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
        const offers = await this.offerRepository.find({
            match: {
                profileId: profileId
            }
        });

        const result: Offer[] = [];

        for await (const offer of offers) {
            if (offer.previewUrl && offer.previewExpriredAt && offer.previewExpriredAt > new Date().getTime()) {
                result.push(offer);
            }
            else if (offer.preview?.key) {
                const { url, expiresIn } = await this.s3BucketPreview.generateSignedUrl(offer.preview.key);
                await this.offerRepository.update(offer.id, { previewUrl: url, previewExpriredAt: expiresIn });
                result.push({ ...offer, previewUrl: url, previewExpriredAt: expiresIn });
            }
        }

        return result;
    }



    async createOffer(profileId: string, data: IOfferInput, file: Express.Multer.File): Promise<Offer | null> {
        const id = await this.offerRepository.create({ ...data, profileId: profileId });
        await this.updateImage(id, profileId, file);
        return this.offerRepository.findById(id);
    }

    async updateImage(id: string, profileId: string, file: Express.Multer.File) {
        const preview = await this.imageCompressorService.compressImage(file.buffer, 320, 320);
        const compressed = await this.imageCompressorService.compressImage(file.buffer, 1280);

        const previewSize = await this.imageCompressorService.getImageSize(compressed);
        const previewBucket = await this.s3BucketPreview.upload(preview, `${profileId}/${id}.jpg`);
        const compressedBucket = await this.s3BucketCompressed.upload(compressed, `${profileId}/${id}.jpg`);

        await this.offerRepository.update(id, {
            preview: {
                ...previewBucket,
                height: 320,
                width: 320
            }, compressed: {
                ...compressedBucket,
                height: previewSize.height,
                width: previewSize.width
            },
            previewUrl: undefined,
            previewExpriredAt: undefined,
            compressedUrl: undefined,
            compressedExpriredAt: undefined
        });

        return;

    }

    async updateOffer(profileId: string, id: string, data: IOfferInput): Promise<Offer | null> {
        const offer = await this.offerRepository.findOne({
            match: {
                id: id,
                profileId: profileId,
            }
        });
        if (!offer) {
            throw new NotFoundException('Offer not found');
        }
        await this.offerRepository.update(id, { ...data });
        return this.offerRepository.findById(id);
    }

    async deleteOffer(profileId: string, id: string) {
        const data = await this.offerRepository.findOne({
            match: {
                id: id,
                profileId: profileId,
            }
        });

        if (!data) {
            throw new NotFoundException('Offer not found');
        }

        //TODO: checking offer twice, which is not good
        await this.offerRepository.remove(id);
        return data;
    }

    async getOffersByProfileId(profileId: string): Promise<Offer[]> {
        return this.offerRepository.find({
            match: { profileId: profileId },
        });
    }
}
