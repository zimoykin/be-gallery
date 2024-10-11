import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { PhotoType } from './enums/photo-type.enum';
import { PhotoModel } from '../../libs/models/photo/photo.model';
import { PhotoService } from './photo.service';
import { ProfileService } from '../../profile-service/profiles/profile.service';
import { PhotoRepository } from 'src/libs/models/photo/photo.repository';
@Injectable()
export class PublicPhotoService {
  private readonly logger = new Logger(PublicPhotoService.name);

  constructor(
    private readonly photoRepository: PhotoRepository,
    private readonly photoService: PhotoService,
    private readonly profileService: ProfileService,
  ) { }

  async getUsersPhotosByFolderIdAndProfileId(
    profileId: string,
    folderId: string,
  ) {
    const photos = await this.photoRepository.find({ profileId, folderId });
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
    const photos = await this.photoRepository.findRandomPublicPhotos();
    const profileIds: string[] = [...new Set(photos.map((photo) => String(photo.profileId)))];
    const profiles = await this.profileService.findProfileByIds(profileIds);

    const result: PhotoModel[] = [];
    for await (const photo of photos.sort(() => Math.random() - 0.5)) {
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
