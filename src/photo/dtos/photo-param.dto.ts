import { IsIn, IsString, IsUUID } from 'class-validator';

export class PhotoParamDto {
  @IsUUID()
  folderId: string;

  @IsString()
  @IsIn(['original', 'preview', 'compressed'])
  type: 'original' | 'preview' | 'compressed'; //TODO: use enum here
}
