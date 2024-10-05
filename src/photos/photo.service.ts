import { forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DynamoDbRepository } from '../dynamo-db/dynamo-db.repository';
import { Photo, PhotoData } from './models/photo.model';
import { InjectRepository } from '../dynamo-db/decorators/inject-model.decorator';
import { S3BucketService } from '../s3-bucket/s3-bucket.service';
import { InjectS3Bucket } from '../s3-bucket/inject-s3-bucket.decorator';
import { ImageCompressorService } from '../image-compressor/image-compressor.service';
import { InternalServerError } from '@aws-sdk/client-dynamodb';
import { PhotoType } from './enums/photo-type.enum';
import { FolderService } from '../folders/folder.service';
import { InjectSender } from 'src/lib/decorators';
import { AmqpSender } from 'src/lib/amqp.sender';

@Injectable()
export class PhotoService {
  private readonly logger = new Logger(PhotoService.name);
  constructor(
    // @ts-ignore //
    @InjectRepository(Photo.name)
    private readonly photoRepository: DynamoDbRepository<Photo>,
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
    //@ts-ignore
    @Inject(forwardRef(() => FolderService))
    private readonly folderService: FolderService,
    //@ts-ignore
    @InjectSender('folder_favorite_changed')
    private readonly sender: AmqpSender,
  ) { }

  /**
   * Resizes an image and saves it to s3.
   * @param file the buffer of the image
   * @param photoId the id of the photo
   * @throws NotFoundException if photoId does not exist
   * @throws InternalServerError if there are any errors
   */
  private async resizeImage(file: Buffer, photoId: string, key: string) {
    const photo = await this.photoRepository.findById(photoId);
    if (!photo) {
      throw new NotFoundException(
        'could not find photo, could not resize image',
      );
    }

    const imageSize = await this.imageCompressorService.getImageSize(file);

    const [previewWidth, previewHeight] = [
      Math.min(320, imageSize.width),
      Math.min(320, imageSize.height),
    ];
    const compressedWidth = Math.min(1280, imageSize.width);

    const preview = await this.imageCompressorService.compressImage(
      file,
      previewWidth,
      previewHeight,
    );
    const bucketPreview = await this.s3BucketServicePreview.upload(
      preview,
      key,
    );

    const compressed = await this.imageCompressorService.compressImage(
      file,
      compressedWidth,
    );
    const bucketCompressed = await this.s3BucketServiceCompressed.upload(
      compressed,
      key,
    );

    await this.photoRepository
      .update(photoId, {
        ...photo,
        compressed: { ...bucketCompressed, width: compressedWidth },
        preview: {
          ...bucketPreview,
          width: previewWidth,
          height: previewHeight,
        },
      })
      .catch((err) => {
        this.logger.error(err);
        throw new InternalServerError(err);
      });
  }

  private async getUrlByType(type: PhotoType, photo: Photo) {
    switch (type) {
      case 'preview':
        if (photo.preview?.key)
          return this.s3BucketServicePreview.generateSignedUrl(
            photo.preview?.key,
          );
        break;
      case 'compressed':
        if (photo.compressed?.key)
          return this.s3BucketServiceCompressed.generateSignedUrl(
            photo.compressed?.key,
          );
        break;
      default:
        if (photo.bucket?.key)
          return this.s3BucketServiceOriginal.generateSignedUrl(
            photo.bucket?.key,
          );
        break;
    }
  }

  async createPhotoObject(
    folderId: string,
    profileId: string,
    data: Partial<Photo>,
    file: Express.Multer.File,
  ) {
    const photos = await this.photoRepository.find({
      match: {
        folderId: folderId,
        profileId: profileId,
      },
    });

    if (photos.length >= 10) {
      throw new Error(
        `You can't create more than 10 photos for a folder. You have ${photos.length}`,
      );
    }

    const bucket = await this.s3BucketServiceOriginal.upload(
      file.buffer,
      `${profileId}/${folderId}/${file.originalname}`,
    );
    return this.photoRepository
      .create<PhotoData>({
        ...data,
        folderId,
        profileId: profileId,
        bucket: bucket,
        camera: data.camera ?? 'no info',
        sortOrder: data.sortOrder || photos.length + 1,
        privateAccess: 0
      })
      .then(async (id) => {
        await this.resizeImage(
          file.buffer,
          id,
          `${profileId}/${folderId}/${file.originalname}`,
        );
        return { id, ...data };
      });
  }

  async getSpecificPhotoByIdByFolderId(
    folderId: string,
    profileId: string,
    id: string,
    type: PhotoType,
  ): Promise<Photo & { url?: string; isFavorite: boolean; }> {

    const folder = await this.folderService.findByFolderId(folderId);
    if (!folder) {
      throw new NotFoundException();
    }

    const photo = await this.photoRepository.find<Photo>({
      match: {
        folderId: folderId,
        id: id,
        profileId: profileId,
      },
    });

    if (photo.length === 0) {
      throw new NotFoundException();
    } else
      return {
        ...photo[0],
        url: await this.getUrlByType(type, photo[0]),
        isFavorite: folder.favoriteFotoId !== undefined && folder.favoriteFotoId === id,
      };
  }

  async findPhotoById(id: string): Promise<Photo & { url: string; }> {
    const photo = await this.photoRepository.findById(id);
    if (!photo) {
      throw new NotFoundException();
    }

    return {
      ...photo,
      url: (await this.getUrlByType(PhotoType.PREVIEW, photo)) ?? '',
    };
  }

  /**
   * @description
   * Returns a list of photos by folder id and profile id, sorted by sortOrder.
   * If the privateAccess parameter is provided, it will be used as a filter.
   *
   * @param folderId The id of the folder
   * @param type The type of photo to retrieve (preview, compressed or original)
   * @param profileId The id of the profile
   * @param privateAccess The private access level of the photos - 0 = public, 1 = private
   * @returns A list of photos, with their url property set to the signed url of the photo
   */
  async getPhotosByFolderIdAndProfileId(
    folderId: string,
    type: PhotoType,
    profileId: string,
    privateAccess?: number,
  ): Promise<Array<Photo & { url: string; }>> {
    const filter = {
      match: {
        folderId: folderId,
        profileId: profileId,
      },
    };

    if (privateAccess !== undefined) {
      filter.match['privateAccess'] = privateAccess;
    }

    const folder = await this.folderService.findByFolderId(folderId);
    if (!folder) {
      throw new NotFoundException();
    }

    const photos = await this.photoRepository.find<Photo>(filter);

    if (photos.length === 0) {
      return [];
    } else {
      const sighnedPhotos: Array<Photo & { url: string; isFavorite: boolean; }> = [];

      for await (const photo of photos) {
        const url = await this.getUrlByType(type, photo);
        if (url) sighnedPhotos.push({ ...photo, url: url, isFavorite: folder.favoriteFotoId !== undefined && folder.favoriteFotoId === photo.id });
      }
      return sighnedPhotos.sort((a, b) => a.sortOrder - b.sortOrder);
    }
  }

  async getTotalPhotosByFolderId(
    folderId: string,
    profileId: string,
  ): Promise<number> {
    const count = await this.photoRepository.countByFilter({
      match: {
        folderId: folderId,
        profileId: profileId,
      },
    });

    return count ?? 0;
  }

  async updatePhoto(
    profileId: string,
    folderId: string,
    id: string,
    data: Partial<Photo>,
  ) {
    const photo = await this.photoRepository.findOneByFilter({
      match: {
        profileId: profileId,
        folderId: folderId,
        id: id,
      },
    });
    if (!photo) {
      throw new NotFoundException();
    }

    return this.photoRepository.update(id, data);
  }

  async removePhoto(folderId: string, profileId: string, id: string) {
    const existingPhoto = await this.photoRepository.findOneByFilter<Photo>({
      match: {
        id: id,
        folderId: folderId,
        profileId: profileId,
      },
    });

    if (!existingPhoto) {
      throw new NotFoundException();
    }

    if (existingPhoto.bucket?.key)
      await this.s3BucketServiceOriginal.deleteFile(existingPhoto.bucket?.key);
    if (existingPhoto.preview?.key)
      await this.s3BucketServicePreview.deleteFile(existingPhoto.preview?.key);
    if (existingPhoto.compressed?.key)
      await this.s3BucketServiceCompressed.deleteFile(
        existingPhoto.compressed?.key,
      );

    return this.photoRepository.remove(id);
  }

  async removePhotosByFolderId(folderId: string, profileId: string) {
    const photos = await this.photoRepository.find<Photo>({
      match: {
        folderId: folderId,
        profileId: profileId,
      },
    });

    for await (const photo of photos) {
      await this.s3BucketServiceOriginal.deleteFile(photo.bucket.key);
      await this.photoRepository.remove(photo.id);
    }
  }

  async getTheLastPhoto(): Promise<Photo | null> {
    const photos = await this.photoRepository.find({});
    if (photos.length === 0) {
      return null;
    }
    return photos[photos.length - 1];
  }

  async setFavouriteValue(
    profileId: string,
    folderId: string,
    photoId: string
  ) {

    const folder = await this.folderService.updateFolderByProfileId(folderId, {
      favoriteFotoId: photoId
    }, profileId);

    await this.sender.sendMessage({
      state: 'favorite_changed',
      contentId: photoId
    });

    return folder;
  }


  async findPhotosByIds(ids: string[]) {
    // Fetch photos from the repository
    const photos = await this.photoRepository.find({
      or: {
        id: ids
      }
    });

    // Map over the photos and resolve URLs asynchronously
    const photosWithUrls = await Promise.all(
      photos.map(async (photo) => {
        const url = await this.getUrlByType(PhotoType.PREVIEW, photo);
        return {
          ...photo,
          url,
        };
      })
    );

    return photosWithUrls;
  }

  async updatePhotoLikesCount(id: string, count: number) {
    return this.photoRepository.update(id, { likes: count });
  }

}
