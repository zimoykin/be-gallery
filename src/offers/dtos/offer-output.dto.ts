import { IOfferOutput } from "../interfaces/offer-output.interface";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class OfferOutputDto implements IOfferOutput {
    @Expose()
    id: string;

    @Expose()
    title: string;

    @Expose()
    text?: string;

    @Expose()
    price?: number;

    @Expose()
    image?: string;

    @Expose()
    preview: string;

    @Expose()
    location?: string;

    @Expose()
    category?: 'trip' | 'hotel' | 'restaurant' | 'camera' | 'lens' | 'other';

    @Expose()
    url?: string;

    @Expose()
    profileId: string;

    @Expose()
    availableUntil: number;
}