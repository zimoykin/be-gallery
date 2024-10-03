import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { AmqpConsumer, InjectConsumer } from "@zimoykin/amqp";
import { Profile } from "./models/profile.model";
import { ProfileService } from "./profile.service";

type ProfileDto = {
    name: string;
    email: string;
    id: string;
    role: 'user' | 'admin';
};

@Injectable()
export class ProfileConsumer implements OnModuleInit {
    private readonly logger = new Logger(ProfileConsumer.name);

    constructor(
        private readonly profileService: ProfileService,
        // @ts-ignore
        @InjectConsumer(Profile.name) private readonly consumer: AmqpConsumer
    ) { }

    onModuleInit() {
        this.consumer.subscribe<ProfileDto>(async msg => {
            this.logger.debug(JSON.stringify(msg));

            const profile = this.profileService.findProfileByUserId(msg.id);
            if (!profile) {
                this.logger.debug('profile not found, creating');
                await this.profileService.createProfile(msg.id, msg.name, msg.email);
            }
        });
    }
}