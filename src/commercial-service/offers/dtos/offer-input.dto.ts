import { IsIn, IsString } from "class-validator";
import { IOfferInput } from "../../../libs/models/offer-input.interface";

export class OfferInputDto implements IOfferInput {

    @IsString()
    title: string;

    @IsString()
    text?: string;

    @IsString()
    price?: number;

    @IsString()
    image?: string;

    @IsString()
    preview: string;

    @IsString()
    location?: string;

    @IsString()
    @IsIn(['trip', 'hotel', 'restaurant', 'camera', 'lens', 'other'])
    category?: 'trip' | 'hotel' | 'restaurant' | 'camera' | 'lens' | 'other';

    @IsString()
    url?: string;
}