import { IsEnum, IsString, IsUUID } from 'class-validator';
import { PhotoType } from '../enums/photo-type.enum';

export class PhotosParamDto {
  @IsUUID()
  folderId: string;

  @IsString()
  @IsEnum(PhotoType)
  type: PhotoType;
}
