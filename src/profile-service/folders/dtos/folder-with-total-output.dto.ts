import { Exclude, Expose } from 'class-transformer';
import { FolderOutputDto } from './folder-output.dto';

@Exclude()
export class FoldeWithTotalOutputDto extends FolderOutputDto {
  @Expose()
  totalPhotos: number;
}
