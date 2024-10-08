import { BadRequestException, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectRepository } from 'src/dynamo-db/decorators/inject-model.decorator';
import { DynamoDbRepository } from 'src/dynamo-db/dynamo-db.repository';
import { FolderService } from 'src/folders/folder.service';
import { Folder } from 'src/folders/models/folder.model';
import { folders } from 'src/folders/models/folder.seeds';
import { ImageCompressorService } from 'src/image-compressor/image-compressor.service';
import { AmqpSender } from 'src/lib/amqp.sender';
import { InjectSender } from 'src/lib/decorators';
import { Offer } from 'src/offers/models/offer.model';
import { offers } from 'src/offers/models/offer.seed';
import { PhotoModel } from 'src/photos/models/photo.model';
import { seedPhotos } from 'src/photos/models/photo.seeds';
import { Profile } from 'src/profiles/models/profile.model';
import { profiles } from 'src/profiles/models/profile.seed';
import { InjectS3Bucket } from 'src/s3-bucket/inject-s3-bucket.decorator';
import { S3BucketService } from 'src/s3-bucket/s3-bucket.service';

@Injectable()
export class SeedingService implements OnApplicationBootstrap {
    private readonly logger = new Logger(SeedingService.name);
    constructor(
        // @ts-ignore
        @InjectModel(PhotoModel.name)
        private readonly photoRepo: Model<PhotoModel>,
        // @ts-ignore
        @InjectRepository(Profile.name)
        private readonly profileRepo: DynamoDbRepository<Profile>,
        // @ts-ignore
        @InjectRepository(Folder.name)
        private readonly folderRepo: DynamoDbRepository<Folder>,
        // @ts-ignore //
        @InjectS3Bucket('photos')
        private readonly s3BucketServiceOriginal: S3BucketService,
        // @ts-ignore //
        @InjectS3Bucket('preview')
        private readonly s3BucketServicePreview: S3BucketService,
        // @ts-ignore //
        @InjectS3Bucket('compressed')
        private readonly s3BucketServiceCompressed: S3BucketService,
        private readonly imageCompressorService: ImageCompressorService,
        private readonly config: ConfigService,
        //@ts-ignore
        @InjectSender('folder_favorite_changed')
        private readonly sender: AmqpSender,
        //@ts-ignore
        @InjectRepository(Offer.name) private repo: DynamoDbRepository<Offer>,

    ) { }

    private getTwoRandomInt(min: number, max: number): [number, number] {

        const first = Math.floor(Math.random() * (max - min) + min);
        let second = Math.floor(Math.random() * (max - min) + min);
        while (second === first) {
            second = Math.floor(Math.random() * (max - min) + min);
        }

        return [
            first,
            second
        ];
    }

    async onApplicationBootstrap() {
        if (this.config.get('NODE_ENV') !== 'seeding') {
            return;
        }

        const photos = seedPhotos();
        let photoIndex = 0;

        for await (const prof of profiles) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const profile = await this.profileRepo.findById(prof.id).catch(() => null);
            if (profile) {
                continue;
            }
            const createdProfile = await this.profileRepo.create({
                ...prof
            });
            this.logger.log(`Profile created: ${createdProfile}`);
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const hisFolder = folders(createdProfile);
            const twoRndomFolders = this.getTwoRandomInt(0, hisFolder.length - 1);
            for await (const folderId of twoRndomFolders) {
                const folder = folders(createdProfile)[folderId];
                const createdFolder = await this.folderRepo.create({
                    ...folder,
                    profileId: createdProfile
                });
                this.logger.log(`Folder created: ${createdFolder}`);
                await new Promise((resolve) => setTimeout(resolve, 1000));


                let lastPhoto;
                for await (const index of [photoIndex, photoIndex + 1]) {
                    if (index >= photos.length) {
                        continue;
                    }
                    const photo = photos[index];
                    const imageBuffer = await this.imageCompressorService.getImageBufferFromUrl(photo.url);
                    const originalname = photo.url.split('/').find((x) => x.includes('.jpeg')) ?? `${createdProfile}-${createdFolder}-${index}.jpg`;

                    const key = `${createdProfile}/${folderId}/${originalname}`;
                    const bucket = await this.s3BucketServiceOriginal.upload(
                        imageBuffer,
                        key
                    );
                    const bucketOrigdUrl = await this.s3BucketServiceOriginal.generateSignedUrl(bucket.key);

                    const imageSize = await this.imageCompressorService.getImageSize(imageBuffer);

                    const compressedWidth = Math.min(1280, imageSize.width);

                    const compressed = await this.imageCompressorService.compressImage(
                        imageBuffer,
                        compressedWidth,
                    );
                    const bucketCompressed = await this.s3BucketServiceCompressed.upload(
                        compressed,
                        key,
                    );
                    //generate link for preview
                    const bucketCompressedUrl = await this.s3BucketServiceCompressed.generateSignedUrl(bucketCompressed.key);

                    const [previewWidth, previewHeight] = [
                        Math.min(320, imageSize.width),
                        Math.min(320, imageSize.height),
                    ];

                    const preview = await this.imageCompressorService.compressImage(
                        imageBuffer,
                        previewWidth,
                        previewHeight,
                    );
                    const bucketPreview = await this.s3BucketServicePreview.upload(
                        preview,
                        key,
                    );
                    //generate link for preview
                    const bucketPreviewUrl = await this.s3BucketServicePreview.generateSignedUrl(bucketPreview.key);

                    const createdPhoto = await this.photoRepo
                        .create({
                            ...photo,
                            folderId: createdFolder,
                            profileId: createdProfile,
                            original: bucket,
                            camera: photo.camera ?? 'no info',
                            sortOrder: photo.sortOrder,
                            originalUrl: bucketOrigdUrl.url,
                            originalUrlAvailableUntil: bucketOrigdUrl.expiresIn,
                            privateAccess: 0,
                            compressed: { ...bucketCompressed, width: compressedWidth },
                            preview: {
                                ...bucketPreview,
                                width: previewWidth,
                                height: previewHeight,
                            },
                            previewUrl: bucketPreviewUrl.url,
                            previewUrlAvailableUntil: bucketPreviewUrl.expiresIn,

                            compressedUrl: bucketCompressedUrl.url,
                            compressedUrlAvailableUntil: bucketCompressedUrl.expiresIn
                        });

                    this.logger.log(`Photo created: ${createdPhoto.id}`);

                    lastPhoto = createdPhoto._id.toString();
                }

                photoIndex += 2;

                if (lastPhoto) {
                    await this.folderRepo.update(createdFolder, {
                        favoriteFotoId: lastPhoto
                    });
                    await this.sender.sendMessage({
                        state: 'favorite_changed',
                        contentId: lastPhoto
                    });
                }
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }


        const randomProfilesNumbers = [...this.getTwoRandomInt(0, profiles.length - 1)];

        const profile1 = profiles[randomProfilesNumbers[0]];
        const profile2 = profiles[randomProfilesNumbers[1]];

        for await (const offer of offers(profile1.id, profile2.id)) {
            await this.repo.create({
                ...offer
            });
            new Promise((resolve) => setTimeout(resolve, 1000));
        }

        process.exit(0);
    }
}
