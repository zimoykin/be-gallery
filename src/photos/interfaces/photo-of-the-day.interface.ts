import { IProfile } from '../../profiles/interfaces/profile.interface';
import { IPhoto } from './photo.interface';

export interface IPhotoOfTheDay {
  photo: IPhoto;
  profile: IProfile;
}
