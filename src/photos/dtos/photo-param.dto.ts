import { IsEnum, IsString, IsUUID } from 'class-validator';
import { PhotoType } from '../enums/photo-type.enum';

export class PhotoParamDto {
  @IsUUID()
  folderId: string;

  @IsString()
  photoId: string;

  @IsString()
  @IsEnum(PhotoType)
  type: PhotoType;
}
