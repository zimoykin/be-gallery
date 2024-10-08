import { BadRequestException, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
import { Photo, PhotoData } from 'src/photos/models/photo.model';
import { seedPhotos } from 'src/photos/models/photo.seeds';
import { Profile } from 'src/profiles/models/profile.model';
import { profiles } from 'src/profiles/models/profile.seed';
import { InjectS3Bucket } from 'src/s3-bucket/inject-s3-bucket.decorator';
import { S3BucketService } from 'src/s3-bucket/s3-bucket.service';
import { topics } from 'src/topics/models/topic.seed';

@Injectable()
export class SeedingService implements OnApplicationBootstrap {
    private readonly logger = new Logger(SeedingService.name);
    constructor(
        // @ts-ignore
        @InjectRepository(Photo.name)
        private readonly photoRepo: DynamoDbRepository<Photo>,
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

        for await (const prof of profiles) {
            const profile = await this.profileRepo.findById(prof.id).catch(() => null);
            if (profile) {
                continue;
            }
            const createdProfile = await this.profileRepo.create({
                ...prof
            });
            this.logger.log(`Profile: ${createdProfile}`);
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const hisFolder = folders(createdProfile);
            const twoRndomFolders = this.getTwoRandomInt(0, hisFolder.length - 1);
            for await (const folderId of twoRndomFolders) {
                const folder = folders(createdProfile)[folderId];
                const createdFolder = await this.folderRepo.create({
                    ...folder,
                    profileId: createdProfile
                });
                this.logger.log(`Folder: ${createdFolder}`);
                await new Promise((resolve) => setTimeout(resolve, 1000));

                const photos = seedPhotos();

                const indexs = [...new Set([
                    ...this.getTwoRandomInt(0, photos.length - 1),
                    ...this.getTwoRandomInt(0, photos.length - 1),
                    ...this.getTwoRandomInt(0, photos.length - 1),
                ])];

                let lastPhoto;
                for await (const index of indexs) {
                    const photo = photos[index];
                    const imageBuffer = await this.imageCompressorService.getImageBufferFromUrl(photo.url);
                    const originalname = photo.url.split('/').find((x) => x.includes('.jpg')) ?? `${createdProfile}-${createdFolder}-${index}.jpg`;

                    const key = `${createdProfile}/${folderId}/${originalname}`;
                    const bucket = await this.s3BucketServiceOriginal.upload(
                        imageBuffer,
                        key
                    );

                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    const createdPhoto = await this.photoRepo
                        .create<PhotoData>({
                            ...photo,
                            folderId: createdFolder,
                            profileId: createdProfile,
                            bucket: bucket,
                            camera: photo.camera ?? 'no info',
                            sortOrder: photo.sortOrder,
                            privateAccess: 0
                        });
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    const photoAlreadyCreated = await this.photoRepo.findById(createdPhoto);
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    if (!photoAlreadyCreated) {
                        throw new BadRequestException('Photo not created');
                    }

                    const imageSize = await this.imageCompressorService.getImageSize(imageBuffer);

                    const [previewWidth, previewHeight] = [
                        Math.min(320, imageSize.width),
                        Math.min(320, imageSize.height),
                    ];
                    const compressedWidth = Math.min(1280, imageSize.width);

                    const preview = await this.imageCompressorService.compressImage(
                        imageBuffer,
                        previewWidth,
                        previewHeight,
                    );
                    const bucketPreview = await this.s3BucketServicePreview.upload(
                        preview,
                        key,
                    );

                    const compressed = await this.imageCompressorService.compressImage(
                        imageBuffer,
                        compressedWidth,
                    );
                    const bucketCompressed = await this.s3BucketServiceCompressed.upload(
                        compressed,
                        key,
                    );

                    await this.photoRepo
                        .update(createdPhoto, {
                            ...photo,
                            compressed: { ...bucketCompressed, width: compressedWidth },
                            preview: {
                                ...bucketPreview,
                                width: previewWidth,
                                height: previewHeight,
                            },
                        });

                    await new Promise((resolve) => setTimeout(resolve, 1000));

                    lastPhoto = createdPhoto;
                }

                if (lastPhoto) {
                    await this.folderRepo.update(createdFolder, {
                        favoriteFotoId: lastPhoto
                    });
                    await this.sender.sendMessage({
                        state: 'favorite_changed',
                        contentId: lastPhoto
                    });
                }
                await new Promise((resolve) => setTimeout(resolve, 1000));

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
