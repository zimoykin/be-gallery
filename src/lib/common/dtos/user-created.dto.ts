import { IsIn, IsString } from "class-validator";

export class UserCreatedDto {
    @IsString()
    name: string;

    @IsString()
    email: string;

    @IsString()
    id: string;

    @IsString()
    @IsIn(['user', 'admin'])
    role: 'user' | 'admin';
};