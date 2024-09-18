import { IsBoolean, IsNotEmptyObject, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { Equipment } from "./equipment.dto";

export class ProfileInDto {
    @IsString()
    name: string;

    @IsBoolean()
    @IsOptional()
    privateAccess?: boolean;

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