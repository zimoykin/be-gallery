import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class PhotoInputDto {

    @IsNumber()
    @Type(() => Number)
    sortOrder: number;

    @IsString()
    @IsNotEmpty()
    camera: string;

    @IsString()
    @IsOptional()
    lens?: string;

    @IsString()
    @IsOptional()
    iso?: string;

    @IsString()
    @IsOptional()
    film?: string;

    @IsString()
    @IsOptional()
    location?: string;

    @IsString()
    @IsOptional()
    description?: string;
}