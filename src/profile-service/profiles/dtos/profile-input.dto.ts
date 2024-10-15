import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class ProfileInDto {
  @IsString()
  name: string;

  @IsBoolean()
  @IsOptional()
  privateAccess?: boolean;

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
