import { IOfferOutput } from "../interfaces/offer-output.interface";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class OfferOutputDto implements IOfferOutput {
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

    url?: string;
}