import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectS3Bucket } from "../../libs/s3-bucket/inject-s3-bucket.decorator";
import { S3BucketService } from "../../libs/s3-bucket/s3-bucket.service";
import { ImageCompressorService } from "../../libs/image-compressor/image-compressor.service";
import { InjectConsumer, InjectSender } from "../../libs/amqp/decorators";
import { AmqpSender } from "../../libs/amqp/amqp.sender";
import { AmqpConsumer } from "../../libs/amqp/amqp.consumer";
import { FolderDominantColor, FolderFavoriteChanged } from "../../libs/amqp/common/dtos/folder-favorite.dto";
import { PhotoRepository } from "../../libs/models/photo/photo.repository";


@Injectable()
export class PhotoConsumer implements OnModuleInit {
    private readonly logger = new Logger(PhotoConsumer.name);
    constructor(
        private readonly photoRepository: PhotoRepository,
        // @ts-ignore
        @InjectConsumer('folder_favorite_changed') private readonly favoriteConsumer: AmqpConsumer,
        // @ts-ignore
        @InjectSender('folder_dominant_color') private readonly sender: AmqpSender,
        // @ts-ignore
        @InjectS3Bucket('preview')
        private readonly s3BucketServicePreview: S3BucketService,
        private readonly imageCompressorService: ImageCompressorService,
    ) { }

    async onModuleInit() {
        this.favoriteConsumer.subscribe<FolderFavoriteChanged>(async (msg) => {
            this.logger.debug(JSON.stringify(msg));
            const photo = await this.photoRepository.findById(msg.contentId);
            if (!photo) {
                throw new Error('Photo not found');
            }

            let url;
            if (photo.previewUrl && (photo?.previewUrlAvailableUntil ?? 0) > Date.now()) {
                //if url is still available, then use it
                url = photo.previewUrl;
            } else if (photo.preview?.key) {
                const signedUrl = await this.s3BucketServicePreview.generateSignedUrl(photo.preview?.key);
                await this.photoRepository.update(photo._id, { previewUrl: signedUrl.url, previewUrlAvailableUntil: signedUrl.expiresIn });
                url = signedUrl.url;
            }

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
        });
    }
}