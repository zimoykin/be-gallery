import { Exclude, Expose, Transform } from 'class-transformer';
import { IEquipment } from '../../../libs/models/equipment/eqiupment.interface';

@Exclude()
export class ProfileOutputDto {

  @Transform((value) => value.obj._id)
  @Expose({ name: 'id' })
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
    coordinates: number[];
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
  favoriteCamera?: IEquipment;

  @Expose()
  favoriteLens?: IEquipment;
}
