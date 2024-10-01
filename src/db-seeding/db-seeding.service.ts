import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '../dynamo-db/decorators/inject-model.decorator';
import { DynamoDbRepository } from '../dynamo-db/dynamo-db.repository';
import { Profile } from '../profiles/profile.model';
import { getFolders, getMessages, offers, profiles, topics } from './seeds.constant';
import { Folder } from '../folders/folder.model';
import { Offer } from 'src/offers/models/offer.model';
import { Topic } from 'src/topic/models/topic.model';
import { Message } from 'src/messages/models/message.model';
import { ProfileService } from 'src/profiles/profile.service';
import { v4 as uuid } from 'uuid';
import { ImageCompressorService } from 'src/image-compressor/image-compressor.service';
import { PhotoService } from 'src/photos/photo.service';

@Injectable()
export class DbSeedingService {
    private readonly logger = new Logger(DbSeedingService.name);
    constructor(
        // @ts-ignore
        @InjectRepository(Profile.name) private readonly profileRepository: DynamoDbRepository<Profile>,
        // @ts-ignore
        @InjectRepository(Folder.name) private readonly folderRepository: DynamoDbRepository<Folder>,
        // @ts-ignore
        @InjectRepository(Offer.name) private readonly offerRepository: DynamoDbRepository<Offer>,
        // @ts-ignore //
        @InjectRepository(Topic.name) private readonly topicRepository: DynamoDbRepository<Topic>,
        // @ts-ignore //
        @InjectRepository(Message.name) private readonly messageRepository: DynamoDbRepository<Message>,
        private readonly profileService: ProfileService,
        private readonly imgCompressor: ImageCompressorService,
        // private readonly photoService: PhotoService
    ) { }


    private async getImageFromUrl(url: string, fileName?: string) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const nameForFile = `${fileName ?? uuid()}.jpg`;

            let file;
            if (blob.type === 'image/svg+xml') {
                const arrayBuffer = await blob.arrayBuffer();
                const jpgBuffer = await this.imgCompressor.convertSvgToJpg(Buffer.from(arrayBuffer));
                if (jpgBuffer) {
                    file = new File([jpgBuffer], nameForFile, { type: 'image/jpeg' });
                    file['buffer'] = jpgBuffer;
                }
            } else {
                file = new File([blob], nameForFile, { type: blob.type });
                const arrayBuffer = await blob.arrayBuffer();
                file['buffer'] = Buffer.from(arrayBuffer);
            }
            if (file) {
                file['originalname'] = nameForFile;
                file['mimetype'] = 'image/jpeg';

                return file;
            }
        } catch (error) {
            this.logger.error('Error fetching or processing image:', url, error);
            const image = new Image();
            image.src = url;
            const img = await new Promise((resolve, reject) => {
                image.onload = resolve;
                image.onerror = reject;
            });

        }
    }

    async seeding() {
        // seed the database here
        const jd = await this.profileRepository.findOneByFilter({ match: { userId: '1' } });
        if (!jd) {
            await Promise.all(profiles.map(profile => {
                return this.profileRepository.create({ ...profile }).then(({ id: profileId }) => {
                    this.logger.log(`created profile ${profile.userId}`);
                    // create folders
                    getFolders(profileId).map(folder => {
                        return this.folderRepository.create(folder).then((fld) => {
                            this.logger.log(`created folder ${fld.id} for profile ${profileId}`);
                        });
                    });

                    // create offers
                    offers(profileId).map(offer => {
                        this.offerRepository.create({ ...offer, profileId }).then(offer => {
                            this.logger.log(`created offer ${offer.id} for profile ${profileId}`);
                        });
                    });

                    // create topics
                    topics(profileId).map(topic => {
                        this.topicRepository.create({ ...topic, profileId }).then(topic => {
                            this.logger.log(`created topic ${topic.id} for profile ${profileId}`);
                        });
                    });
                });
            }));

            //create fake messages
            const profilesCreated = await this.profileRepository.readByFilter<Profile>({
                or: {
                    'userId': profiles?.map(profile => profile.userId)
                }
            });
            profilesCreated.forEach(profile1 => {
                profilesCreated.forEach(profile2 => {
                    this.logger.log(`created message ${profile1.id} to ${profile2.id}`);
                    getMessages(profile1.id, profile2.id)
                        .map(message => {
                            this.messageRepository.create(message);
                        });
                });
            });

            //avatar
            profilesCreated.forEach(async (profile) => {
                const profileSeed = profiles.find(profile1 => profile1.userId === profile.userId);
                if (profileSeed?.url) {
                    const image = await this.getImageFromUrl(profileSeed.url, `${profile.id}.jpg`);
                    if (image) {
                        await this.profileService.createProfilePhoto(profile.id, image);
                    }
                }
            });

            // //create fake photos        
            // const foldersCreated = await this.folderRepository.readByFilter<Folder>({
            //     or: {
            //         'profileId': profilesCreated.map(profile => profile.id)
            //     }
            // });
            // foldersCreated.forEach(folder => {
            //     const profile = profilesCreated.find(profile => profile.id === folder.profileId);
            //     getFolders(folder.profileId).map(async ({ url, title, description }, index) => {
            //         if (url) {
            //             const image = await this.getImageFromUrl(url, `${folder.id}.jpg`);
            //             if (image) {
            //                 this.photoService.createPhotoObject(folder.id, folder.profileId, {
            //                     location: profile?.location,
            //                     camera: profile?.equipment?.find(e => e.type === 'camera')?.name,
            //                     lens: profile?.equipment?.find(e => e.type === 'lens')?.name,
            //                     sortOrder: index + 1,
            //                     likes: Math.floor(Math.random() * 100),
            //                     iso: Math.random() > .5 ? '400' : '200',
            //                     film: Math.random() > .5 ? 'KODAK PORTRA 800' : 'digital',
            //                     description: description ?? title
            //                 }, image);
            //             }
            //         }
            //     });

            // });

        }
    }
}
