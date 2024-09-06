import { IsNotEmpty, IsNumber, IsOptional, IsString, isString } from "class-validator";


export class FolderInputDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    bgColor: string;

    @IsString()
    @IsNotEmpty()
    color: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsNumber()
    sortOrder: number;

}