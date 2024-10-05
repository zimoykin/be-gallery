import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { InjectConsumer } from '../lib/decorators';
import { UserCreatedDto } from '../lib/common/dtos/user-created.dto';
import { AmqpConsumer } from '../lib/amqp.consumer';

@Injectable()
export class ProfileConsumer implements OnModuleInit {
  private readonly logger = new Logger(ProfileConsumer.name);

  constructor(
    private readonly profileService: ProfileService,
    // @ts-ignore
    @InjectConsumer('user_created') private readonly consumer: AmqpConsumer,
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
  }
}
