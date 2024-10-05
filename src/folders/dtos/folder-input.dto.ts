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

  @IsNumber()
  @ApiProperty({
    example: 0,
  })
  @IsOptional()
  privateAccess?: number;
}
