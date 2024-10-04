import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class FolderInputDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'ITALY: 2024',
  })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '#d9e86b',
  })
  bgColor: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '#000000',
  })
  color: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'KODAK PORTRA 800',
  })
  description: string;

  @IsNumber()
  @ApiProperty({
    example: 1,
  })
  sortOrder: number;

  @IsUUID()
  @IsOptional()
  favoriteFotoId?: string;
}
