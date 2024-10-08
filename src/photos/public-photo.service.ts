import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from 'src/dynamo-db/decorators/inject-model.decorator';
import { DynamoDbRepository } from 'src/dynamo-db/dynamo-db.repository';
import { PhotoOfTheDay } from './models/photo-of-the-day.model';
import { DateTime } from 'luxon';
import { PhotoService } from './photo.service';
import { IPhotoOfTheDay } from './interfaces/photo-of-the-day.interface';
import { PhotoType } from './enums/photo-type.enum';
import { ProfileService } from 'src/profiles/profile.service';
import { Photo } from './models/photo.model';
import { IPhoto } from './interfaces/photo.interface';
import { ImageCompressorService } from 'src/image-compressor/image-compressor.service';
import { InjectS3Bucket } from 'src/s3-bucket/inject-s3-bucket.decorator';
import { S3BucketService } from 'src/s3-bucket/s3-bucket.service';

@Injectable()
export class PublicPhotoService {
  private readonly logger = new Logger(PublicPhotoService.name);

  constructor(
    //@ts-ignore//
    @InjectRepository(PhotoOfTheDay.name)
    private readonly photoOfTheDayRepository: DynamoDbRepository<PhotoOfTheDay>,
    //@ts-ignore//
    @InjectRepository(Photo.name)
    private readonly photoRepo: DynamoDbRepository<Photo>,
    private readonly photoService: PhotoService,
    private readonly profileService: ProfileService,
    private readonly imageService: ImageCompressorService,
    // @ts-ignore //
    @InjectS3Bucket('preview')
    private readonly s3BucketServicePreview: S3BucketService,
  ) { }

  private async determinePhotoOfTheDay(): Promise<PhotoOfTheDay | null> {
    const from = DateTime.local().startOf('day').toMillis();
    const to = DateTime.local().endOf('day').toMillis();

    const photoOfTheDay = await this.photoOfTheDayRepository.findOneByFilter({
      gte: {
        photoDay: from,
      },
      lte: {
        photoDay: to,
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
        photoDay: from,
      });

      if (!newPhotoOfTheDay) {
        throw new InternalServerErrorException(
          'could not create photo of the day',
        );
      }

      return this.photoOfTheDayRepository.findById(newPhotoOfTheDay);
    } else {
      return photoOfTheDay;
    }
  }

  async getPhotoOfTheDay(): Promise<IPhotoOfTheDay> {
    const potd = await this.determinePhotoOfTheDay();
    if (!potd) {
      throw new InternalServerErrorException(
        'could not determine photo of the day',
      );
    } else {
      const photo = await this.photoService.findPhotoById(potd.photoId);
      if (!photo) {
        throw new InternalServerErrorException(
          'could not find photo of the day',
        );
      }

      const profile = await this.profileService.findProfileById(
        photo.profileId,
      );
      return {
        photo,
        profile,
      };
    }
  }

  async getUsersPhotosByFolderIdAndProfileId(
    profileId: string,
    folderId: string,
  ) {
    const photos = await this.photoService.getPhotosByFolderIdAndProfileId(
      folderId,
      PhotoType.PREVIEW,
      profileId,
      0,
    );
    const profile = await this.profileService.findProfileById(profileId);

    return photos.map((photo) => {
      return {
        photo,
        profile,
      };
    });
  }


  async getFavouritePhotos() {
    const photos = await this.photoRepo.find({
      match: {
        privateAccess: 0
      }
    });

    const reduced = photos?.reduce((acc, photo) => {
      if (!acc.some(pred => pred.url === photo.url)) {
        acc.push(photo);
      }

      return acc;
    }, [] as Photo[]) ?? [];

    const profileIds = reduced.map((photo) => photo.profileId);
    const profiles = await this.profileService.findProfileByIds(profileIds);

    const result: Photo[] = [];
    for await (const photo of reduced) {
      //has static url
      if (photo.url) {
        result.push(photo);
      }
      else if (photo.preview?.key) {
        const url = await this.s3BucketServicePreview.generateSignedUrl(photo.preview?.key);
        await this.photoRepo.update(photo.id, {
          url: url,
          urlAvailableUntil: Date.now() + 7 * 24 * 3600 * 1000
        });
        result.push({ ...photo, url });
      }
    }

    return result.map((photo) => {
      return {
        photo: { ...photo },
        profile: profiles.find((profile) => profile.id === photo.profileId),
      };
    });
  }

}
