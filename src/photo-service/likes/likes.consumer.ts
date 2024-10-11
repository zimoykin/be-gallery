import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { LikesService } from "./likes.service";
import { InjectConsumer } from "../../libs/amqp/decorators";
import { AmqpConsumer } from "../../libs/amqp/amqp.consumer";
import { PhotoRepository } from "../../libs/models/photo/photo.repository";
import { LikeRepository } from "src/libs/models/like/like.repository";

@Injectable()
export class LikesConsumer implements OnModuleInit {
    private readonly logger = new Logger(LikesConsumer.name);

    constructor(
        // @ts-ignore
        @InjectConsumer('like_added') private readonly consumer: AmqpConsumer,
        private readonly photoRepository: PhotoRepository,
        private readonly likeRepository: LikeRepository
    ) { }


    async onModuleInit() {
        await this.consumer.subscribe<{
            state: 'added' | 'removed', // actually doesn't matter for now
            contentId: string;
        }>(async (msg) => {
            this.logger.debug(JSON.stringify(msg));
            //new like added, we have to update the photo likes count
            const count = await this.likeRepository.count({ match: { contentId: msg.contentId } });
            await this.photoRepository.update(msg.contentId, { likes: count });
        });
    }
}