import { Expose, Type } from "class-transformer";
import { IsBoolean, IsIn, IsString, ValidateNested } from "class-validator";

export class Equipment {
    @Expose()
    @IsString()
    name: string;

    @Expose()
    @IsBoolean()
    favorite: boolean;

    @Expose()
    @IsString()
    @IsIn(['camera', 'lens', 'other'])
    type: 'camera' | 'lens' | 'other';
}

// export class Equipments {
//     @Expose()
//     @Type(() => Equipment)
//     @ValidateNested({ each: true })
//     cameras: Equipment[];

//     @Expose()
//     @Type(() => Equipment)
//     @ValidateNested({ each: true })
//     lenses: Equipment[];
// }