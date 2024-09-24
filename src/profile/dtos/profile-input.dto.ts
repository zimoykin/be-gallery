import { IsBoolean, IsNotEmptyObject, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { Equipment } from "./equipment.dto";

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

    @IsOptional()
    @Type(() => Array<Equipment>)
    @ValidateNested({ each: true })
    equipment?: Equipment[];

}