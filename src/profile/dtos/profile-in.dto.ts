import { IsBoolean, IsNotEmptyObject, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { Equipments } from "./equipment.dto";
import { IEquipment } from "../interfaces/eqiupment.interface";

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

    @IsNotEmptyObject()
    @IsOptional()
    @Type(() => Equipments)
    @ValidateNested()
    equipment?: IEquipment;

}