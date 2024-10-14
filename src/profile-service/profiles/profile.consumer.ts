import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { InjectConsumer } from 'src/libs/amqp/decorators';
import { AmqpConsumer } from 'src/libs/amqp/amqp.consumer';
import { UserCreatedDto } from 'src/libs/amqp/common/dtos/user-created.dto';
import { EquipmentFavoriteDto } from 'src/libs/amqp/common/dtos/equipment.dto';
import { IProfile } from 'src/libs/models/profile/profile.interface';

@Injectable()
export class ProfileConsumer implements OnModuleInit {
  private readonly logger = new Logger(ProfileConsumer.name);

  constructor(
    private readonly profileService: ProfileService,
    // @ts-ignore
    @InjectConsumer('user_created') private readonly consumer: AmqpConsumer,
    // @ts-ignore
    @InjectConsumer('favorite_equipment') private readonly eqipmentConsumer: AmqpConsumer

  ) { }

  onModuleInit() {
    this.consumer.subscribe<UserCreatedDto>(async (msg) => {
      this.logger.debug(JSON.stringify(msg));

      const profile = this.profileService.findProfileByUserId(msg.id);
      if (!profile) {
        this.logger.debug('profile not found, creating');
        await this.profileService.createProfile(msg.id, msg.name, msg.email);
      }
    });


    this.eqipmentConsumer.subscribe<EquipmentFavoriteDto>(async (msg) => {
      this.logger.debug(JSON.stringify(msg));

      const upd: Partial<IProfile> = {};
      if (msg.category === 'camera') {
        upd.favoriteCamera = {
          category: msg.category,
          id: msg.id,
          name: msg.name,
          favorite: msg.favorite,
          profileId: msg.profileId
        };
      } else if (msg.category === 'lens') {
        upd.favoriteLens = {
          category: msg.category,
          id: msg.id,
          name: msg.name,
          favorite: msg.favorite,
          profileId: msg.profileId
        };
      }

      if (Object.keys(upd).length) {
        await this.profileService.updateProfile(msg.profileId, upd);
      }
    });
  }
}
