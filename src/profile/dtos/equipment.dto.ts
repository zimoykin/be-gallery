import { Expose, Type } from "class-transformer";
import { IsBoolean, IsString, ValidateNested } from "class-validator";

class Equipment {
    @Expose()
    @IsString()
    name: string;

    @Expose()
    @IsBoolean()
    favorite: boolean;
}

export class Equipments {
    @Expose()
    @Type(() => Equipment)
    @ValidateNested({ each: true })
    cameras: Equipment[];

    @Expose()
    @Type(() => Equipment)
    @ValidateNested({ each: true })
    lenses: Equipment[];
}