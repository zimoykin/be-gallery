import { OfferCategory } from "../../../libs/models/offers/offer-category.enum";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class OfferOutputDto {
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
    previewUrl: string;

    @Expose()
    compressedUrl: string;

    @Expose()
    category?: OfferCategory;

    @Expose()
    location?: string;

    @Expose()
    profileId: string;

    @Expose()
    availableUntil: number;
}