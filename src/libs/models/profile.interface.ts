import { IEquipment } from './eqiupment.interface';

export interface IProfile {
  id: string;
  userId: string;
  name?: string;
  email?: string;
  location?: {
    lat: number;
    long: number;
    title: string;
    distance: number;
  };
  bio?: string;
  website?: string;
  privateAccess: number;
  bucket?: { url: string; key: string; bucketName: string; folder: string; };
  equipment?: IEquipment[];
  url?: string;

  favoriteCamera?: IEquipment;
  favoriteLens?: IEquipment;
}
