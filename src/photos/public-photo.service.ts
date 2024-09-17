import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { InjectRepository } from "src/dynamo-db/decorators/inject-model.decorator";
import { DynamoDbRepository } from "src/dynamo-db/dynamo-db.repository";
import { PhotoOfTheDay } from "./models/photo-of-the-day.model";
import { DateTime } from 'luxon';
import { PhotoService } from "./photo.service";
import { IPhotoOfTheDay } from "./interfaces/photo-of-the-day.interface";
import { PhotoType } from "./enums/photo-type.enum";

@Injectable()
export class PublicPhotoService {
    private readonly logger = new Logger(PublicPhotoService.name);

    constructor(
        @InjectRepository(PhotoOfTheDay.name) private readonly photoOfTheDayRepository: DynamoDbRepository<PhotoOfTheDay>,
        private readonly photoService: PhotoService
    ) { }

    private async determinePhotoOfTheDay(): Promise<PhotoOfTheDay> {

        const from = DateTime.local().startOf('day').toMillis();
        const to = DateTime.local().endOf('day').toMillis();

        const photoOfTheDay = await this.photoOfTheDayRepository.findOneByFilter({
            gte: {
                photoDay: from
            },
            lte: {
                photoDay: to
            },
        });

        if (!photoOfTheDay) {
            //lets create one
            const photo = await this.photoService.getTheLastPhoto();
            if (!photo) {
                throw new InternalServerErrorException('could not get last photo');
            }

            const newPhotoOfTheDay = await this.photoOfTheDayRepository.create({
                photoId: photo.id,
                photoDay: from
            });

            return newPhotoOfTheDay;
        } else {
            return photoOfTheDay;
        }
    }


    async getPhotoOfTheDay(): Promise<IPhotoOfTheDay> {
        const potd = await this.determinePhotoOfTheDay();
        if (!potd) {
            throw new InternalServerErrorException('could not determine photo of the day');
        }
        else {
            const photo = await this.photoService.findPhotoById(potd.photoId);
            if (!photo) {
                throw new InternalServerErrorException('could not find photo of the day');
            }

            return {
                camera: photo.camera,
                id: photo.id,
                url: photo.url,
                film: photo.film,
                lens: photo.lens,
                likes: 0,
                userId: photo.userId
            };
        }
    }

    async getUsersPhotosByFolderId(userId: string, folderId: string) {
        return this.photoService.getPhotosByFolderId(folderId, PhotoType.PREVIEW, userId);
    }
}