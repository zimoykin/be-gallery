import { IsBoolean, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { ServiceCategory } from 'src/libs/models/offers/offer-category.enum';

export class ProfileInDto {
  @IsOptional()
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

  @IsOptional()
  @IsString({ each: true })
  @IsEnum(ServiceCategory, { each: true })
  categories?: (keyof typeof ServiceCategory)[];
}
