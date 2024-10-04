import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class PhotoOutputDto {
  @Expose()
  id: string;
  @Expose()
  sortOrder: number;
  @Expose()
  profileId: string;
  @Expose()
  folderId: string;
  @Expose()
  camera: string;
  @Expose()
  lens?: string;
  @Expose()
  iso?: string;
  @Expose()
  film?: string;
  @Expose()
  location?: string;
  @Expose()
  description?: string;
  @Expose()
  url: string;

  @Expose()
  likes: number;

  @Expose()
  privateAccess: number; // 0 = public, 1 = private

  @Expose()
  isFavorite: boolean;
}
