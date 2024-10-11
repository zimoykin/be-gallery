import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Profile } from '../../libs/models/profile/profile.model';
import { S3BucketService } from '../../libs/s3-bucket/s3-bucket.service';
import { ImageCompressorService } from '../../libs/image-compressor/image-compressor.service';
import { InjectS3Bucket } from '../../libs/s3-bucket/inject-s3-bucket.decorator';
import { ProfileRepository } from '../../libs/models/profile/profile.repository';
import { EquipmentRepository } from '../../libs/models/equipment/equipment.repository';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);
  constructor(
    private readonly profileRepository: ProfileRepository,
    // @ts-ignore //
    @InjectS3Bucket('profile')
    private readonly s3BucketService: S3BucketService,
    private readonly imageCompressorService: ImageCompressorService,
    private readonly eqipmentRepository: EquipmentRepository,
  ) { }

  private isFile(data: any): data is Express.Multer.File {
    return data.mimetype !== undefined;
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


  async findProfileByIds(profileIds: string[]) {
    const profiles = await this.profileRepository.find({
      or: {
        id: profileIds,
      }
    });
    //get all avatars
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

  async findProfileByUserId(userId: string) {
    const profile = await this.profileRepository.findOne({
      match: { userId: userId },
    });

    if (!profile) {
      throw new NotFoundException('could not find profile');
    }

    const favoriteEquipment = await this.eqipmentRepository.findFavoriteEquipmentByProfileId(profile?.id);

    if (profile?.bucket?.key) {
      const signedUrl = await this.s3BucketService.generateSignedUrl(
        profile.bucket.key,
      );
      return {
        ...profile,
        url: signedUrl.url,
        favoriteEquipment
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
    const profile = await this.profileRepository.findById(id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    } else {
      const updatedProfile = Object.assign(profile, dto);
      return this.profileRepository.update(profile.id, updatedProfile);
    }
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
      `${profile.id}/${profile.id}${'.jpeg'}`,
    );

    //update profile
    const result = await this.profileRepository.update(profile.id, { bucket });

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

    const favoriteEquipment = await this.eqipmentRepository.findFavoriteEquipmentByProfileId(profile?.id);

    if (profile.bucket?.key) {
      const signedUrl = await this.s3BucketService.generateSignedUrl(
        profile.bucket.key,
      );
      return {
        ...profile,
        url: signedUrl.url,
        favoriteEquipment
      };
    }

    return profile;
  }
}
