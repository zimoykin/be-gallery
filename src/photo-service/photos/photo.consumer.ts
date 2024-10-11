import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PhotoModel } from "./models/photo.model";
import { InjectS3Bucket } from "../../libs/s3-bucket/inject-s3-bucket.decorator";
import { S3BucketService } from "../../libs/s3-bucket/s3-bucket.service";
import { ImageCompressorService } from "../../libs/image-compressor/image-compressor.service";
import { InjectConsumer, InjectSender } from "../../libs/amqp/decorators";
import { AmqpSender } from "../../libs/amqp/amqp.sender";
import { AmqpConsumer } from "../../libs/amqp/amqp.consumer";
import { FolderDominantColor, FolderFavoriteChanged } from "../../libs/amqp/common/dtos/folder-favorite";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";


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
        @InjectModel(PhotoModel.name) private readonly photoRepository: Model<PhotoModel>,
        private readonly imageCompressorService: ImageCompressorService,
    ) { }

    async onModuleInit() {
        this.consumer.subscribe<FolderFavoriteChanged>(async (msg) => {
            this.logger.debug(JSON.stringify(msg));
            const photo = await this.photoRepository.findById({ _id: msg.contentId }).lean();
            if (!photo) {
                throw new Error('Photo not found');
            }

            let url;
            if (photo.previewUrl && (photo?.previewUrlAvailableUntil ?? 0) > Date.now()) {
                //if url is still available, then use it
                url = photo.previewUrl;
            } else if (photo.preview?.key) {
                const signedUrl = await this.s3BucketServicePreview.generateSignedUrl(photo.preview?.key);
                await this.photoRepository.findByIdAndUpdate({ _id: photo._id }, { url: signedUrl, urlAvailableUntil: signedUrl.expiresIn });
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