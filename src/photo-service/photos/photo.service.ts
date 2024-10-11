import { forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { S3BucketService } from '../../libs/s3-bucket/s3-bucket.service';
import { InjectS3Bucket } from '../../libs/s3-bucket/inject-s3-bucket.decorator';
import { ImageCompressorService } from '../../libs/image-compressor/image-compressor.service';
import { InternalServerError } from '@aws-sdk/client-dynamodb';
import { PhotoType } from './enums/photo-type.enum';
import { InjectSender } from '../../libs/amqp/decorators';
import { AmqpSender } from '../../libs/amqp/amqp.sender';
import { InjectModel } from '@nestjs/mongoose';
import { PhotoModel } from '../../libs/interfaces/models/photo.model';
import { Model } from 'mongoose';
import { FolderService } from 'src/profile-service/folders/folder.service';

@Injectable()
export class PhotoService {
  private readonly logger = new Logger(PhotoService.name);
  constructor(
    // @ts-ignore //
    @InjectModel(PhotoModel.name)
    private readonly photoRepository: Model<PhotoModel>,
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

    const signedUrlPreview = await this.s3BucketServiceOriginal.generateSignedUrl(
      bucketPreview.key,
    );
    const signedUrlCompressed = await this.s3BucketServiceOriginal.generateSignedUrl(
      bucketCompressed.key,
    );

    await this.photoRepository
      .findByIdAndUpdate(photoId, {
        $set: {
          compressed: bucketCompressed,
          preview: {
            ...bucketPreview,
            width: previewWidth,
            height: previewHeight,
          },
          previewUrl: signedUrlPreview.url,
          previewUrlAvailableUntil: signedUrlPreview.expiresIn,

          compressedUrl: signedUrlCompressed.url,
          compressedUrlAvailableUntil: signedUrlCompressed.expiresIn,
        }
      })
      .then((res) => {
        this.logger.log(`updated photo ${photoId}`, res);
      })
      .catch((err) => {
        this.logger.error(err);
        throw new InternalServerError(err);
      });
  }

  /**
   * Generate a new signed url for a given key and type
   * @param id the id of the photo object
   * @param type the type of the url to update
   * @param key the key of the object in s3
   * @returns {Promise<{url: string, expiresIn: number}>} signed url and expiration time in milliseconds
   */
  private async generateNewSignedUrl(id: string, type: PhotoType, key: string): Promise<{ url: string; expiresIn?: number; }> {
    // update photo object 
    switch (type) {
      case 'preview': {
        //generate new signed url
        const signedUrl = await this.s3BucketServicePreview.generateSignedUrl(
          key,
        );
        await this.photoRepository.findOneAndUpdate({ _id: id }, { $set: { previewUrl: signedUrl.url, previewUrlAvailableUntil: signedUrl.expiresIn } });
        return signedUrl;
      }
      case 'compressed': {
        //generate new signed url
        const signedUrl = await this.s3BucketServiceCompressed.generateSignedUrl(
          key,
        );
        await this.photoRepository.findOneAndUpdate({ _id: id }, { $set: { compressedUrl: signedUrl.url, compressedUrlAvailableUntil: signedUrl.expiresIn } });
        return signedUrl;
      }
      case 'original': {
        //generate new signed url
        const signedUrl = await this.s3BucketServiceOriginal.generateSignedUrl(
          key,
        );
        await this.photoRepository.findOneAndUpdate({ _id: id }, { $set: { originalUrl: signedUrl.url, originalUrlAvailableUntil: signedUrl.expiresIn } });
        return signedUrl;
      }
      default: throw new Error('Invalid type');

    }
  }

  async getUrlByType(type: PhotoType, photo: PhotoModel) {
    switch (type) {
      case 'preview':
        if (photo.preview) {
          //if url is still available, then use it
          if (photo.previewUrl && photo?.previewUrlAvailableUntil && photo.previewUrlAvailableUntil > Date.now()) {
            return { url: photo.previewUrl, expiresIn: photo.previewUrlAvailableUntil };
          }
          //if url is expired, then generate new one
          else if (photo?.previewUrlAvailableUntil && photo.previewUrlAvailableUntil < Date.now() && photo.preview?.key) {
            return this.generateNewSignedUrl(photo._id, type, photo.preview?.key);
          } else if (photo.preview?.key) {
            return this.generateNewSignedUrl(photo._id, type, photo.preview?.key);
          }
        } else {
          throw new Error('No preview available');
        }
      case 'compressed':
        if (photo.compressedUrl) {
          //if url is still available, then use it
          if (photo?.compressedUrlAvailableUntil && photo.compressedUrlAvailableUntil > Date.now()) {
            return { url: photo.compressedUrl, expiresIn: photo.previewUrlAvailableUntil };
          }
          //if url is expired, then generate new one
          else if (photo?.compressedUrlAvailableUntil && photo.compressedUrlAvailableUntil < Date.now() && photo.compressed?.key) {
            return this.generateNewSignedUrl(photo._id, type, photo.compressed?.key);
          } else if (photo.compressed?.key) {
            return this.generateNewSignedUrl(photo._id, type, photo.compressed?.key);
          }
        } else {
          throw new Error('No preview available');
        }
      default:
        if (photo.originalUrl) {
          //if url is still available, then use it
          if (photo?.originalUrlAvailableUntil && photo.originalUrlAvailableUntil > Date.now()) {
            return { url: photo.originalUrl, expiresIn: photo.originalUrlAvailableUntil };
          }
          //if url is expired, then generate new one
          else if (photo?.originalUrlAvailableUntil && photo.originalUrlAvailableUntil < Date.now() && photo.original?.key) {
            return this.generateNewSignedUrl(photo._id, type, photo.original?.key);
          } else if (photo.original?.key) {
            return this.generateNewSignedUrl(photo._id, type, photo.original?.key);
          }
        } else {
          throw new Error('No preview available');
        }
    }
  }

  async createPhotoObject(
    folderId: string,
    profileId: string,
    data: Partial<PhotoModel>,
    file: Express.Multer.File,
  ) {
    const photos = await this.photoRepository.find({
      folderId: folderId,
      profileId: profileId,
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
    const signedUrl = await this.s3BucketServiceOriginal.generateSignedUrl(
      bucket.key,
    );
    return this.photoRepository
      .create({
        ...data,
        folderId,
        profileId: profileId,
        original: bucket,
        camera: data.camera ?? 'no info',
        sortOrder: data.sortOrder || photos.length + 1,
        privateAccess: 0,
        originalUrl: signedUrl.url,
        originalUrlAvailableUntil: signedUrl.expiresIn,
      })
      .then(async (data) => {
        await this.resizeImage(
          file.buffer,
          data._id,
          `${profileId}/${folderId}/${file.originalname}`,
        );
        return { id: data._id, ...data };
      });
  }

  // async getSpecificPhotoByIdByFolderId(
  //   folderId: string,
  //   profileId: string,
  //   id: string,
  //   type: PhotoType,
  // ): Promise<Photo & { url?: string; isFavorite: boolean; }> {

  //   const folder = await this.folderService.findByFolderId(folderId);
  //   if (!folder) {
  //     throw new NotFoundException();
  //   }

  //   const photo = await this.photoRepository.find<Photo>({
  //     match: {
  //       folderId: folderId,
  //       id: id,
  //       profileId: profileId,
  //     },
  //   });

  //   const signedUrl = await this.getUrlByType(type, photo[0]);
  //   if (photo.length === 0) {
  //     throw new NotFoundException();
  //   } else
  //     return {
  //       ...photo[0],
  //       url: signedUrl?.url,
  //       urlAvailableUntil: signedUrl?.expiresIn ?? 0,
  //       isFavorite: folder.favoriteFotoId !== undefined && folder.favoriteFotoId === id,
  //     };
  // }

  async findPhotoById(id: string, profileId: string, type: PhotoType): Promise<PhotoModel> {
    const photo = await this.photoRepository.findOne({
      _id: id,
      profileId: profileId
    });
    if (!photo) {
      throw new NotFoundException();
    }
    const signedUrl = await this.getUrlByType(type, photo);

    return {
      ...photo,
      [`${type}Url`]: signedUrl?.url ?? '',
      [`${type}UrlAvailableUntil`]: signedUrl?.expiresIn ?? 0
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
  ): Promise<Array<PhotoModel>> {
    const filter = {
      folderId: folderId,
      profileId: profileId,
    };

    if (privateAccess !== undefined) {
      filter['privateAccess'] = privateAccess;
    }

    const photos = await this.photoRepository.find({
      ...filter
    }).lean();

    if (photos.length === 0) {
      return [];
    } else {
      const sighnedPhotos: Array<PhotoModel> = [];
      for await (const photo of photos) {
        const signedUrl = await this.getUrlByType(type, photo).catch(() => {
          this.logger.debug(`Failed to generate signed url for photo ${photo._id}`);;
        });

        if (!signedUrl) {
          continue;
        }

        const image = {
          [`${type}Url`]: signedUrl?.url ?? '',
          [`${type}UrlAvailableUntil`]: signedUrl?.expiresIn ?? 0
        };
        if (signedUrl?.url)
          sighnedPhotos.push({
            ...photo,
            ...image
          });
      }
      return sighnedPhotos.sort((a, b) => a.sortOrder - b.sortOrder);
    }
  }

  async getTotalPhotosByFolderId(
    folderId: string,
    profileId: string,
  ): Promise<number> {
    const count = await this.photoRepository.count({
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
    data: Partial<PhotoModel>,
  ) {
    const photo = await this.photoRepository.findOne({
      profileId: profileId,
      folderId: folderId,
      _id: id,
    });
    if (!photo) {
      throw new NotFoundException();
    }

    return this.photoRepository.findByIdAndUpdate({ _id: id }, data);
  }

  async removePhoto(folderId: string, profileId: string, id: string) {
    const existingPhoto = await this.photoRepository.findOne({
      id: id,
      folderId: folderId,
      profileId: profileId,
    }).lean();

    if (!existingPhoto) {
      throw new NotFoundException();
    }

    if (existingPhoto.original?.key)
      await this.s3BucketServiceOriginal.deleteFile(existingPhoto.original?.key);
    if (existingPhoto.preview?.key)
      await this.s3BucketServicePreview.deleteFile(existingPhoto.preview?.key);
    if (existingPhoto.compressed?.key)
      await this.s3BucketServiceCompressed.deleteFile(
        existingPhoto.compressed?.key,
      );

    return this.photoRepository.findByIdAndDelete({
      _id: id
    });
  }

  async removePhotosByFolderId(folderId: string, profileId: string) {
    const photos = await this.photoRepository.find({
      folderId: folderId,
      profileId: profileId,
    });

    for await (const photo of photos) {
      await this.s3BucketServiceOriginal.deleteFile(photo.original.key);
      await this.photoRepository.remove(photo.id);
    }
  }

  async getTheLastPhoto(): Promise<PhotoModel | null> {
    const photos = await this.photoRepository.find();
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
      id: {
        $or: ids
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
    return this.photoRepository.findByIdAndUpdate({ _id: id }, { likes: count });
  }

}
