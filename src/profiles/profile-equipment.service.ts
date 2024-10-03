import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '../dynamo-db/decorators/inject-model.decorator';
import { DynamoDbRepository } from '../dynamo-db/dynamo-db.repository';
import { Profile } from './models/profile.model';
import { IEquipment } from './interfaces/eqiupment.interface';

@Injectable()
export class ProfileEquipmentService {
    private readonly logger = new Logger(ProfileEquipmentService.name);
    constructor(
        // @ts-ignore //
        @InjectRepository('Profile') private readonly profileRepository: DynamoDbRepository<Profile>,
    ) { }

    async findEquipmentProfileById(profileId: string) {
        const profile = await this.profileRepository.findById(profileId);
        if (!profile) {
            throw new NotFoundException('Profile not found');
        }
        return profile.equipment ?? [];
    }
    async appendEquipment(profileId: string, equip: IEquipment) {
        const profile = await this.profileRepository.findById(profileId);
        if (!profile) {
            throw new NotFoundException('Profile not found');
        }
        else {
            const updatedProfile = Object.assign(profile, { equipment: [...profile?.equipment ?? [], equip] });
            const result = await this.profileRepository.update(profile.id, updatedProfile);

            return result?.equipment ?? [];
        }
    }

    async removeEquipment(profileId: string, equip: IEquipment) {
        const profile = await this.profileRepository.findById(profileId);
        if (!profile) {
            throw new NotFoundException('Profile not found');
        }
        else {
            const updatedProfile = Object.assign(
                profile, {
                equipment: profile.equipment?.filter((eq) => eq.name !== equip.name && eq.type !== equip.type)
            });
            return this.profileRepository.update(profile.id, updatedProfile);
        }
    }
}
