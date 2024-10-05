import { IsString, IsUUID } from "class-validator";
import { PayloadDto } from "./base-payload";

export class FolderFavoriteChanged extends PayloadDto {
    @IsString()
    state!: 'favorite_changed';

    @IsString()
    @IsUUID()
    contentId!: string;
}

export class FolderDominantColor extends PayloadDto {
    @IsString()
    state: 'dominant_color_changed';
    
    @IsString()
    @IsUUID()
    contentId: string;

    @IsString()
    leftTopColor: string;
    @IsString()
    leftBottomColor: string;

    @IsString()
    centerTopColor: string;

    @IsString()
    centerBottomColor: string;

    @IsString()
    rightTopColor: string;

    @IsString()
    rightBottomColor: string;
}