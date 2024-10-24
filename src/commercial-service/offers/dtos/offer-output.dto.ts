import { ServiceCategory } from "../../../libs/models/offers/offer-category.enum";
import { Exclude, Expose, Transform } from "class-transformer";

@Exclude()
export class OfferOutputDto {
    @Expose({ name: 'id' })
    @Transform((value) => value.obj._id)
    id: string;

    @Expose()
    title: string;

    @Expose()
    text?: string;

    @Expose()
    price?: number;

    @Expose()
    discount?: number;

    @Expose()
    image?: string;

    @Expose()
    previewUrl: string;

    @Expose()
    compressedUrl: string;

    @Expose()
    categories?: ServiceCategory[];

    @Expose()
    location?: string;

    @Expose()
    profileId: string;

    @Expose()
    availableUntil: number;
}