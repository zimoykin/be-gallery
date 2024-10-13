import { IsIn, IsNumber, IsString } from "class-validator";

export class EquipmentFavoriteDto {
    @IsString()
    id: string;

    @IsString()
    name: string;

    @IsString()
    @IsIn(['camera', 'lens', 'other'])
    category: 'camera' | 'lens' | 'other';

    @IsString()
    profileId: string;

    @IsNumber()
    favorite: number;

}