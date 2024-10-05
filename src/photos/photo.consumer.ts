import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Photo } from "./models/photo.model";
import { InjectS3Bucket } from "../s3-bucket/inject-s3-bucket.decorator";
import { S3BucketService } from "../s3-bucket/s3-bucket.service";
import { InjectRepository } from "../dynamo-db/decorators/inject-model.decorator";
import { DynamoDbRepository } from "../dynamo-db/dynamo-db.repository";
import { ImageCompressorService } from "../image-compressor/image-compressor.service";
import { InjectConsumer, InjectSender } from "../lib/decorators";
import { AmqpSender } from "../lib/amqp.sender";
import { AmqpConsumer } from "../lib/amqp.consumer";
import { FolderDominantColor, FolderFavoriteChanged } from "../lib/common/dtos/folder-favorite";


@Injectable()
export class PhotoConsumer implements OnModuleInit {
    private readonly logger = new Logger(PhotoConsumer.name);
    constructor(
        // @ts-ignore
        @InjectConsumer('folder_favorite_changed') private readonly consumer: AmqpConsumer,
        // @ts-ignore
        @InjectSender('folder_dominant_color') private readonly sender: AmqpSender,
        // @ts-ignore
        @InjectS3Bucket('preview')
        private readonly s3BucketServicePreview: S3BucketService,
        // @ts-ignore
        @InjectRepository(Photo.name) private readonly photoRepository: DynamoDbRepository<Photo>,
        private readonly imageCompressorService: ImageCompressorService,
    ) { }

    async onModuleInit() {
        await this.consumer.subscribe<FolderFavoriteChanged>(async (msg) => {
            this.logger.debug(JSON.stringify(msg));
            const photo = await this.photoRepository.findById(msg.contentId);
            if (!photo) {
                throw new Error('Photo not found');
            }
            if (photo.preview?.key) {
                const url = await this.s3BucketServicePreview.generateSignedUrl(photo.preview?.key);
                const { leftTopColor, leftBottomColor, rightTopColor, rightBottomColor, centerTopColor, centerBottomColor } = await this.imageCompressorService.determineDominantColors(url);

                this.sender.sendMessage<FolderDominantColor>({
                    state: 'dominant_color_changed',
                    contentId: photo.folderId,
                    leftTopColor,
                    leftBottomColor,
                    rightTopColor,
                    rightBottomColor,
                    centerTopColor,
                    centerBottomColor,
                    createdAt: new Date().toISOString()
                });

            }
        });
    }
}