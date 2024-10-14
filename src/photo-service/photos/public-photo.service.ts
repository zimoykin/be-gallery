import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { PhotoType } from './enums/photo-type.enum';
import { PhotoModel } from '../../libs/models/photo/photo.model';
import { PhotoService } from './photo.service';
import { PhotoRepository } from '../../libs/models/photo/photo.repository';
import { ProfileRepository } from '../../libs/models/profile/profile.repository';
@Injectable()
export class PublicPhotoService {
  private readonly logger = new Logger(PublicPhotoService.name);

  constructor(
    private readonly photoRepository: PhotoRepository,
    private readonly photoService: PhotoService,
    private readonly profileRepository: ProfileRepository,
  ) { }

  async getUsersPhotosByFolderIdAndProfileId(
    profileId: string,
    folderId: string,
  ) {
    const photos = await this.photoRepository.find({ profileId, folderId });
    const profile = await this.profileRepository.findById(profileId);

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
    const profiles = await this.profileRepository.findByIds(profileIds);

    const result: PhotoModel[] = [];
    for await (const photo of photos.sort(() => Math.random() - 0.5)) {
      const signedUrl = await this.photoService.getUrlByType(PhotoType.COMPRESSED, photo);
      if (signedUrl) {
        result.push({ ...photo, compressedUrl: signedUrl.url, compressedUrlAvailableUntil: signedUrl.expiresIn });
      }
    }

    return result.map((photo) => {
      return {
        photo: { ...photo },
        profile: profiles.find((profile) => `${profile._id}` === photo.profileId),
      };
    });
  }

}
