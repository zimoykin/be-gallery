import { Injectable, Logger } from "@nestjs/common";
import { FolderDominantColor } from "../../libs/amqp/common/dtos/folder-favorite.dto";
import { AmqpConsumer } from "src/libs/amqp/amqp.consumer";
import { InjectConsumer } from "../../libs/amqp/decorators";
import { FolderRepository } from "src/libs/models/folder/folder.repository";

@Injectable()
export class FolderConsumer {
    private readonly logger = new Logger(FolderConsumer.name);
    constructor(
        //@ts-ignore
        @InjectConsumer('folder_dominant_color') private readonly consumer: AmqpConsumer,
        private readonly folderRepository: FolderRepository
    ) { }

    onModuleInit() {
        this.consumer.subscribe<FolderDominantColor>(async (message) => {
            this.logger.debug(`Received message: ${JSON.stringify(message)}`);
            const { state, contentId, leftBottomColor, leftTopColor, centerBottomColor, centerTopColor, rightBottomColor, rightTopColor } = message;

            await this.folderRepository.update(contentId, {
                leftBottomColor,
                leftTopColor,
                rightBottomColor,
                rightTopColor,
                centerBottomColor,
                centerTopColor
            });

        });
    }
}