import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class PhotoInputDto {
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({
    example: 1,
  })
  sortOrder: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Canon EOS 650',
  })
  camera: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Canon 35-80mm F/4-5.6 IS II USM',
  })
  lens?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '800',
  })
  iso?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'KODAK PORTRA 800',
  })
  film?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Regensburg, DE',
  })
  location?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '2024',
  })
  description?: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    example: '0',
  })
  @Type(() => Number)
  privateAccess?: number; // 0 = public, 1 = private

}
