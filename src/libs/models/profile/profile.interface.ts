import { IEquipment } from '../equipment/eqiupment.interface';

export interface IProfile {
  id: string;
  userId: string;
  name?: string;
  email?: string;
  location?: {
    coordinates?: {
      type: string;
      coordinates: number[];
    };
    lat: number;
    long: number;
    title: string;
    distance: number;
  };
  bio?: string;
  website?: string;
  privateAccess: boolean;
  bucket?: { url: string; key: string; bucketName: string; folder: string; };
  equipment?: IEquipment[];
  url?: string;


  favoriteCamera?: IEquipment;
  favoriteLens?: IEquipment;
}
