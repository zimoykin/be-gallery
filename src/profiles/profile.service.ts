import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '../dynamo-db/decorators/inject-model.decorator';
import { DynamoDbRepository } from '../dynamo-db/dynamo-db.repository';
import { Profile } from './models/profile.model';
import { S3BucketService } from '../s3-bucket/s3-bucket.service';
import { ImageCompressorService } from 'src/image-compressor/image-compressor.service';
import { InjectS3Bucket } from '../s3-bucket/inject-s3-bucket.decorator';
import { IEquipment } from './interfaces/eqiupment.interface';

@Injectable()
export class ProfileService {
    private readonly logger = new Logger(ProfileService.name);
    constructor(
        // @ts-ignore //
        @InjectRepository('Profile') private readonly profileRepository: DynamoDbRepository<Profile>,
        // @ts-ignore //
        @InjectS3Bucket('profile') private readonly s3BucketService: S3BucketService,
        private readonly imageCompressorService: ImageCompressorService,
    ) { }


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

        return profile;
    }

    async findProfileByUserId(userId: string) {
        const profile = await this.profileRepository.findOneByFilter<Profile>({
            match: { userId: userId }
        });

        // if (!profile) {
        //     throw new NotFoundException('Profile not found');
        // }


        if (profile?.bucket?.key) {
            const url = await this.s3BucketService.generateSignedUrl(profile.bucket.key);
            return {
                ...profile,
                url
            };
        }

        return profile;
    }

    async readAllPublicProfiles() {
        const profiles = await this.profileRepository.readByFilter({
            match: { privateAccess: 0 }
        }, 'privateAccess');
        const result: Profile[] = [];
        for await (const profile of profiles) {
            if (profile.bucket?.key) {
                const url = await this.s3BucketService.generateSignedUrl(profile.bucket.key);
                profile.url = url;
                result.push({ ...profile, });
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
        }
        else {
            const updatedProfile = Object.assign(profile, dto);
            return this.profileRepository.update(profile.id, updatedProfile);
        }
    }


    async createProfilePhoto(profileId: string, file: any) {
        const profile = await this.profileRepository.findById(profileId);
        if (!profile) {
            throw new NotFoundException('Profile not found');
        }
        const resized = await this.imageCompressorService.compressImage(file.buffer, 320, 320);
        const bucket = await this.s3BucketService.upload(
            resized,
            `${profile.id}/${profile.id}${'.jpeg'}`,
        );
        return this.profileRepository.update(profile.id, { bucket });
    }

    async findProfileById(id: string) {
        if (!id) {
            throw new NotFoundException('Profile id not found');
        }
        const profile = await this.profileRepository.findOneByFilter({ match: { id } });

        if (!profile) {
            throw new NotFoundException('Profile not found');
        }
        if (profile.bucket?.key) {
            const url = await this.s3BucketService.generateSignedUrl(profile.bucket.key);
            return {
                ...profile,
                url
            };
        }

        return profile;
    }
}
