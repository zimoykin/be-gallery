import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from 'src/dynamo-db/decorators/inject-model.decorator';
import { DynamoDbRepository } from 'src/dynamo-db/dynamo-db.repository';
import { Profile } from './profile.model';

@Injectable()
export class ProfileService {
    private readonly logger = new Logger(ProfileService.name);
    constructor(
        @InjectRepository('Profile') private readonly profileRepository: DynamoDbRepository<Profile>
    ) { }


    async createProfile(userId: string, userName: string) {
        const profile = await this.profileRepository.create({
            userId: userId,
            name: userName ?? 'unknown'
        });

        if (!profile) {
            throw new Error('could not create profile');
        }
        return profile;
    }

    async findProfileByUserId(userId: string) {
        return this.profileRepository.findOneByFilter<Profile>({
            match: { userId }
        });
    }

    async readAllPublicProfiles() {
        return this.profileRepository.readByFilter({
            match: { privateAccess: false }
        });
    }

    async updateProfile(id: string, dto: Partial<Profile>) {
        const profile = await this.profileRepository.findOneByFilter({ match: { userId: id } });
        if (!profile) {
            throw new Error('Profile not found');
        }
        else {
            const updatedProfile = Object.assign(profile, dto);
            return this.profileRepository.update(profile.id, updatedProfile);
        }
    }

    async findProfileById(id: string) {
        return this.profileRepository.findOneByFilter({ match: { id } });
    }
}
