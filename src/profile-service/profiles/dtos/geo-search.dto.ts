import { IsEnum, IsNumber, IsOptional } from "class-validator";
import { ServiceCategory } from "src/libs/models/offers/offer-category.enum";

export class GeoSearchDto {
    @IsNumber()
    lat: number;

    @IsNumber()
    lng: number;

    @IsNumber()
    radius: number;

    @IsEnum(ServiceCategory, { each: true })
    @IsOptional()
    categories?: ServiceCategory[]
}