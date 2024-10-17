import { IsEnum, IsNumber, IsObject, IsOptional, IsString } from "class-validator";
import { ServiceCategory } from "../../../libs/models/offers/offer-category.enum";
import { Transform, Type } from "class-transformer";

export class OfferInputDto {
    @IsString()
    title: string;

    @IsString()
    description?: string;

    @IsObject()
    @IsOptional()
    @Transform(({ value }) => {
        try {
            const location = JSON.parse(value);
            return {
                lat: location.lat,
                long: location.long,
                title: location.title,
                distance: location.distance
            };
        } catch (error) {
            return null;
        }
    })
    location?: {
        lat: number;
        long: number;
        title: string;
        distance: number;
    };

    @Type(() => Number)
    @IsNumber()
    price?: number;

    @IsString()
    @IsEnum(ServiceCategory, { each: true })
    @Transform(({ value }) => {
        if (typeof value === 'object')
            return value;

        try {
            const categories = JSON.parse(value);
            return categories;
        } catch (error) {
            return [];
        }
    })
    categories?: ServiceCategory[];

}