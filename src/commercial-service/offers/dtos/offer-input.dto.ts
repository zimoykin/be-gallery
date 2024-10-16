import { IsEnum, IsNumber, IsString } from "class-validator";
import { ServiceCategory } from "../../../libs/models/offers/offer-category.enum";
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
    @IsEnum(ServiceCategory, { each: true })
    categories?: ServiceCategory[];

}