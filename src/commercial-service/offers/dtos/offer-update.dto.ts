import { IsEnum, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";
import { ServiceCategory } from "../../../libs/models/offers/offer-category.enum";
import { Type } from "class-transformer";
import { LocationDto } from "../../../libs/models/dtos/location.dto";

export class OfferUpdateDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsObject()
    @IsOptional()
    @ValidateNested()
    @Type(() => LocationDto)
    location?: {
        lat: number;
        long: number;
        title: string;
        distance: number;
    };

    @IsOptional()
    @IsNumber()
    price?: number;

    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    discount?: number;

    @IsString({ each: true })
    @IsEnum(ServiceCategory, { each: true })
    categories: (keyof typeof ServiceCategory)[];

}