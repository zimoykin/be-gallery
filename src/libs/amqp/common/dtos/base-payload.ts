import { IsISO8601, IsString } from "class-validator";

export class PayloadDto {
    @IsString()
    @IsISO8601()
    createdAt: string = new Date().toISOString();
}