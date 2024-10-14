import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EquipmentInput } from '../../libs/models/equipment/eqiupment.interface';
import { EquipmentRepository } from '../../libs/models/equipment/equipment.repository';
import { EquipmentSender } from './equipment.sender';

@Injectable()
export class EquipmentService {
  private readonly logger = new Logger(EquipmentService.name);
  constructor(
    private readonly equipRepository: EquipmentRepository,
    private readonly sender: EquipmentSender
  ) { }

  async findEquipmentProfileById(profileId: string) {
    const eqps = await this.equipRepository.find({
      match: { profileId: profileId },
    });
    return eqps ?? [];
  }

  async findFavoriteEquipmentByProfileId(profileId: string) {
    const eqps = await this.equipRepository.find({
      match: { profileId: profileId, favorite: 1 },
    });
    return eqps ?? [];
  }

  async updateEquipment(profileId: string, id: string, update: EquipmentInput) {
    //ensure it exists
    const data = await this.equipRepository.findOne({
      match: { id: id, profileId: profileId },
    });

    if (update.favorite === 1) {
      //we can only have one favorite
      //so we have to update all others to false
      await this.equipRepository.updateAllByFilter({
        match: {
          profileId: profileId,
          category: update.category,
        }
      }, {
        favorite: 0
      });
    }

    if (update.favorite === 1 && data.favorite !== update.favorite) {
      this.logger.debug(`change favorite from ${data.favorite} to ${update.favorite}`);
      await this.sender.sendEquipmentChanged(profileId, data);
    }

    const record = Object.assign(data, update);
    const result = await this.equipRepository.updateById(id, record);

    return result;
  }

  async appendEquipment(profileId: string, equip: EquipmentInput) {
    const eqps = await this.equipRepository.countByProfileId(profileId);
    if (eqps >= 10) {
      throw new BadRequestException(
        `You can't create more than 10 equipment. You have ${eqps}`,
      );
    }

    this.logger.debug(`append ${JSON.stringify(equip)} to ${profileId}`);
    return this.equipRepository.create({ ...equip, profileId: profileId });
  }

  async remove(id: string, profileId: string) {
    const data = await this.equipRepository.findOne({
      match: { id: id, profileId: profileId },
    });
    if (!data) {
      throw new NotFoundException();
    }

    this.logger.debug(`remove ${id} from ${profileId}`);
    return this.equipRepository.remove(id);

  }

}
