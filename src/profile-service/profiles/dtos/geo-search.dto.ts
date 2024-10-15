import { IsEnum, IsNumber, IsOptional } from "class-validator";
import { OfferCategory } from "src/libs/models/offers/offer-category.enum";

export class GeoSearchDto {
    @IsNumber()
    lat: number;

    @IsNumber()
    lng: number;

    @IsNumber()
    radius: number;

    @IsEnum(OfferCategory)
    @IsOptional()
    category?: OfferCategory
}