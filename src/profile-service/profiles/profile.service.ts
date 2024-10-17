import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Profile } from '../../libs/models/profile/models/profile.model';
import { S3BucketService } from '../../libs/s3-bucket/s3-bucket.service';
import { ImageCompressorService } from '../../libs/image-compressor/image-compressor.service';
import { InjectS3Bucket } from '../../libs/s3-bucket/inject-s3-bucket.decorator';
import { ProfileRepository } from '../../libs/models/profile/profile.repository';
import { GeoSearchDto } from './dtos/geo-search.dto';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);
  constructor(
    private readonly profileRepository: ProfileRepository,
    // @ts-ignore //
    @InjectS3Bucket('profile')
    private readonly s3BucketService: S3BucketService,
    private readonly imageCompressorService: ImageCompressorService
  ) { }

  private isFile(data: any): data is Express.Multer.File {
    return data.mimetype !== undefined;
  }

  private async generateAvatarsSignedLink(...profiles: Profile[]) {
    const result: Profile[] = [];
    for await (const profile of profiles) {
      if (profile.url && profile.urlAvailableUntil && new Date < profile.urlAvailableUntil) {
        result.push(profile);
        continue;
      }

      //generate signed url
      if (profile.bucket?.key) {
        const signedUrl = await this.s3BucketService.generateSignedUrl(
          profile.bucket.key,
        );

        if (signedUrl.expiresIn)
          await this.profileRepository.update(profile._id.toString(), {
            url: signedUrl.url,
            urlAvailableUntil: new Date(signedUrl.expiresIn),
          });

        profile.url = signedUrl.url;
        result.push({ ...profile });
      } else {
        result.push(profile);
      }
    }
    return result;
  }

  async createProfile(userId: string, userName: string, email?: string) {
    this.logger.log(`creating profile for user ${userId}`);
    const profile = await this.profileRepository.create({
      userId: userId,
      name: userName ?? 'unknown',
      email: email ?? 'unknown',
    });

    if (!profile) {
      throw new BadRequestException('could not create profile');
    }

    return this.findProfileByUserId(userId);
  }


  async geoSearch(filter: GeoSearchDto) {
    const profiles = await this.profileRepository.geoSearch(filter);
    return this.generateAvatarsSignedLink(...profiles);
  }

  async findProfileByIds(profileIds: string[]) {
    const profiles = await this.profileRepository.findByIds(profileIds);
    return this.generateAvatarsSignedLink(...profiles);
  }

  async findProfileByUserId(userId: string) {
    const profile = await this.profileRepository.findOne(
      { userId: userId },
    );

    if (!profile) {
      throw new NotFoundException('could not find profile');
    }

    if (profile?.bucket?.key) {
      const signedUrl = await this.s3BucketService.generateSignedUrl(
        profile.bucket.key,
      );
      return {
        ...profile,
        url: signedUrl.url
      };
    }

    return profile;
  }

  async readAllPublicProfiles() {
    const profiles = await this.profileRepository.findPublicProfiles();
    const result: Profile[] = [];
    for await (const profile of profiles) {
      if (profile.bucket?.key) {
        const signedUrl = await this.s3BucketService.generateSignedUrl(
          profile.bucket.key,
        );
        profile.url = signedUrl.url;
        result.push({ ...profile });
      } else {
        result.push(profile);
      }
    }
    return result;
  }

  async updateProfile(id: string, dto: Partial<Profile>) {
    return this.profileRepository.update(id, dto);
  }

  async createProfilePhoto(profileId: string, file: unknown) {
    const profile = await this.profileRepository.findById(profileId);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (!this.isFile(file)) {
      throw new BadRequestException('File not found');
    }

    //resize avatar
    const resized = await this.imageCompressorService.compressImage(
      file.buffer,
      320,
      320,
    );

    //delete prev avatar from bucket
    if (profile.bucket?.key)
      await this.s3BucketService.deleteFile(profile.bucket.key);

    //upload new avatar
    const bucket = await this.s3BucketService.upload(
      resized,
      `${profile._id}/${profile._id}${'.jpeg'}`,
    );

    //update profile
    const result = await this.profileRepository.update(profile._id.toString(), { bucket });

    return result;
  }

  async findProfileById(id: string) {
    if (!id) {
      throw new NotFoundException('Profile id not found');
    }
    const profile = await this.profileRepository.findById(id);

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (profile.bucket?.key) {
      const signedUrl = await this.s3BucketService.generateSignedUrl(
        profile.bucket.key,
      );
      return {
        ...profile,
        url: signedUrl.url
      };
    }

    return profile;
  }
}
