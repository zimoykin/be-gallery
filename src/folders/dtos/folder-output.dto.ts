import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class FolderOutputDto {
  @Expose()
  id: string;

  @Expose()
  profileId: string;

  @Expose()
  title: string;

  @Expose()
  leftTopColor: string;

  @Expose()
  leftBottomColor: string;

  @Expose()
  centerTopColor: string;
  
  @Expose()
  centerBottomColor: string;

  @Expose()
  rightTopColor: string;

  @Expose()
  rightBottomColor: string;

  @Expose()
  description: string;

  @Expose()
  sortOrder: number;

  @Expose()
  totalPhotos: number;

  @Expose()
  isFavorite: string;

  @Expose()
  privateAccess: number;

  @Expose()
  url?: string;
}
