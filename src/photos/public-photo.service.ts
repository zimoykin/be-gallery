import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { PhotoService } from './photo.service';
import { PhotoType } from './enums/photo-type.enum';
import { ProfileService } from 'src/profiles/profile.service';
import { Model } from 'mongoose';
import { PhotoModel } from './models/photo.model';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PublicPhotoService {
  private readonly logger = new Logger(PublicPhotoService.name);

  constructor(
    //@ts-ignore//
    @InjectModel(PhotoModel.name)
    private readonly photoRepo: Model<PhotoModel>,
    private readonly photoService: PhotoService,
    private readonly profileService: ProfileService,
  ) { }

  async getUsersPhotosByFolderIdAndProfileId(
    profileId: string,
    folderId: string,
  ) {
    const photos = await this.photoRepo.find({ profileId, folderId }).lean();
    const profile = await this.profileService.findProfileById(profileId);

    for await (const photo of photos) {
      const signedUrl = await this.photoService.getUrlByType(PhotoType.COMPRESSED, photo);
      photo.compressedUrl = signedUrl?.url;
      photo.previewUrlAvailableUntil = signedUrl?.expiresIn ?? 0;
    }

    return photos.map((photo) => {
      return {
        photo,
        profile,
      };
    });
  }


  async getFavouritePhotos() {
    const photos = await this.photoRepo.find({ privateAccess: 0 }).limit(15).lean();

    const profileIds = [...new Set(photos.map((photo) => photo.profileId))];
    const profiles = await this.profileService.findProfileByIds(profileIds);

    const result: PhotoModel[] = [];
    for await (const photo of photos) {
      const signedUrl = await this.photoService.getUrlByType(PhotoType.ORIGINAL, photo);
      if (signedUrl) {
        result.push({ ...photo, originalUrl: signedUrl.url, originalUrlAvailableUntil: signedUrl.expiresIn });
      }
    }

    return result.map((photo) => {
      return {
        photo: { ...photo },
        profile: profiles.find((profile) => profile.id === photo.profileId),
      };
    });
  }

}
