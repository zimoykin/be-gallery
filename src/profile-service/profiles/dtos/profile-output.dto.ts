import { Exclude, Expose, Transform } from 'class-transformer';
import { IEquipment } from '../../../libs/models/equipment/eqiupment.interface';
import { Offer } from 'src/libs/models/offers/offer.model';
import { ServiceCategory } from 'src/libs/models/offers/offer-category.enum';

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

  @Expose()
  categories?: ServiceCategory[];

  @Expose()
  distance: number;
}
