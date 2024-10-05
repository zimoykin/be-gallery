import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { LikesService } from "./likes.service";
import { PhotoService } from "src/photos/photo.service";
import { InjectConsumer } from "src/lib/decorators";
import { AmqpConsumer } from "src/lib/amqp.consumer";

@Injectable()
export class LikesConsumer implements OnModuleInit {
    private readonly logger = new Logger(LikesConsumer.name);

    constructor(
        // @ts-ignore
        @InjectConsumer('like_added') private readonly consumer: AmqpConsumer,
        private readonly photoService: PhotoService,
        private readonly likesService: LikesService
    ) { }


    async onModuleInit() {
        await this.consumer.subscribe<{
            state: 'added' | 'removed', // actually doesn't matter for now
            contentId: string;
        }>(async (msg) => {
            this.logger.debug(JSON.stringify(msg));
            //new like added, we have to update the photo likes count
            const count = await this.likesService.getLikesCountByContentId(msg.contentId);
            await this.photoService.updatePhotoLikesCount(msg.contentId, count);
        });
    }
}