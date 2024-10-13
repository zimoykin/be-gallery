import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class ProfileInDto {
  @IsString()
  name: string;

  @IsNumber()
  @IsOptional()
  privateAccess?: number;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsObject()
  @IsOptional()
  location?: {
    lat: number;
    long: number;
    title: string;
    distance: number;
  };

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  email?: string;
}
