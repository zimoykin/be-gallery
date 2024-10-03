import { IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { EquipmentDto } from "./equipment.dto";

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
    @Type(() => Array<EquipmentDto>)
    @ValidateNested({ each: true })
    equipment?: EquipmentDto[];


    @IsString()
    @IsOptional()
    website?: string;

    @IsString()
    @IsOptional()
    email?: string;

}