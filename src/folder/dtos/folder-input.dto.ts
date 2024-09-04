import { IsNumber, IsString, isString } from "class-validator";


export class FolderInputDto {
    @IsString()
    title: string;

    @IsString()
    bgColor: string;

    @IsString()
    color: string;

    @IsString()
    userId: string;

    @IsNumber()
    sortOrder: number;

}