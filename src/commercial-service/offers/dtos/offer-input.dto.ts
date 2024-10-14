import { IsEnum, IsNumber, IsNumberString, IsString } from "class-validator";
import { OfferCategory } from "../../../libs/models/offers/offer-category.enum";
import { Type } from "class-transformer";

export class OfferInputDto {
    @IsString()
    title: string;

    @IsString()
    text?: string;

    @IsString()
    location?: string;

    @Type(() => Number)
    @IsNumber()
    price?: number;

    @IsString()
    @IsEnum(OfferCategory)
    category?: OfferCategory;

}