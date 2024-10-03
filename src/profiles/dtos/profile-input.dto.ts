import { IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class ProfileInDto {
    @IsString()
    name: string;

    @IsNumber()
    @IsOptional()
    privateAccess?: number;

    @IsString()
    @IsOptional()
    bio?: string;

    @IsString()
    @IsOptional()
    location?: string;

    @IsString()
    @IsOptional()
    website?: string;

    @IsString()
    @IsOptional()
    email?: string;

}