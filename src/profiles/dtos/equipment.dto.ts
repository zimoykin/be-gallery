import { Exclude, Expose} from "class-transformer";
import { IsBoolean, IsIn, IsString } from "class-validator";

@Exclude()
export class EquipmentDto {

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