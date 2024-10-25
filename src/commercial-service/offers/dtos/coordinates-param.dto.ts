import { Type } from "class-transformer";
import { IsNumber } from "class-validator";

export class QueryCoordinatesDto {

    @IsNumber()
    @Type(() => Number)
    latitude: number;

    @IsNumber()
    @Type(() => Number)
    longitude: number;

    @IsNumber()
    @Type(() => Number)
    radius: number;
}