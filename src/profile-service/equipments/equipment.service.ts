import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IEquipment } from '../../libs/interfaces/eqiupment.interface';
import { Equipment } from './models/equipment.model';
import { DynamoDbRepository, InjectRepository } from '../../libs/dynamo-db';

@Injectable()
export class EquipmentService {
  private readonly logger = new Logger(EquipmentService.name);
  constructor(
    // @ts-ignore //
    @InjectRepository(Equipment.name)
    private readonly equipRepository: DynamoDbRepository<Equipment>,
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

  async updateEquipment(profileId: string, id: string, update: IEquipment) {
    const data = await this.equipRepository.findOneByFilter({
      match: { id: id, profileId: profileId },
    });
    if (!data) {
      throw new NotFoundException();
    }

    if (update.favorite === 1) {
      //we can only have one favorite
      //so we have to update all others to false
      await this.equipRepository.updateByFilter(
        {
          match: {
            profileId: profileId,
            category: update.category,
          },
        },
        { favorite: 0 },
      );
    }

    const record = Object.assign(data, update);
    const result = await this.equipRepository.update(id, record);

    return result;
  }
  async appendEquipment(profileId: string, equip: IEquipment) {
    const eqps = await this.equipRepository.countByFilter({
      match: { profileId: profileId },
    });

    if (eqps >= 10) {
      throw new BadRequestException(
        `You can't create more than 10 equipment. You have ${eqps}`,
      );
    }

    return this.equipRepository.create({
      profileId: profileId,
      name: equip.name,
      category: equip.category,
      favorite: equip.favorite,
    });
  }

  async removeEquipment(id: string, profileId: string) {
    const data = await this.equipRepository.findOneByFilter({
      match: { id: id, profileId: profileId },
    });
    if (!data) {
      throw new NotFoundException();
    }
    await this.equipRepository.remove(id);
    return data;
  }
}
