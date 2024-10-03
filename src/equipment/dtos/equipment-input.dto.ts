import { IsIn, IsNumber, IsString } from "class-validator";

export class EquipmentInputDto {
    @IsString()
    name: string;

    @IsNumber()
    @IsIn([1, 0])
    favorite: number = 0; // 1 - true, 0 - false 

    @IsString()
    @IsIn(['camera', 'lens', 'other'])
    category: 'camera' | 'lens' | 'other';
}