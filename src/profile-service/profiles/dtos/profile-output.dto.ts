import { Exclude, Expose } from 'class-transformer';
import { IEquipment } from '../../../libs/models/eqiupment.interface';

@Exclude()
export class ProfileOutputDto {
  @Expose()
  id: string;

  @Expose()
  profileId: string;

  @Expose()
  email: string;

  @Expose()
  privateAccess: boolean;

  @Expose()
  userId: string;

  @Expose()
  location?: {
    lat: number;
    long: number;
    title: string;
    distance: number;
  };

  @Expose()
  bio?: string;

  @Expose()
  name?: string;

  @Expose()
  website?: string;

  @Expose()
  url: string;

  @Expose()
  favoriteEquipment?: Array<IEquipment>;
}
