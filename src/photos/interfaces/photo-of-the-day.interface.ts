import { IProfile } from "src/profile/interfaces/profile.interface";
import { IPhoto } from "./photo.interface";

export interface IPhotoOfTheDay {
    photo: IPhoto,
    profile: IProfile
}