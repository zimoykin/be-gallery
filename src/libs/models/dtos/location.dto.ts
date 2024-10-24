import { IsNumber, IsString } from "class-validator";

export class LocationDto {
    @IsNumber()
    lat: number;
    @IsNumber()
    long: number;
    @IsString()
    title: string;
    @IsNumber()
    distance: number;
}