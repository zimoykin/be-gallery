import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class S3BucketService {
  private readonly logger = new Logger(S3BucketService.name);
  constructor(
    @Inject('S3_BUCKET_NAME') private readonly bucketName: string,
    @Inject('S3_FOLDER_NAME') private readonly folderName: string,
    @Inject('S3_BUCKET_CONNECTION') private readonly s3: S3Client,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  async upload(
    fileBuffer: Buffer,
    key: string,
  ): Promise<{ url: string; key: string; bucketName: string; folder: string; }> {
    const params: PutObjectCommandInput = {
      Bucket: this.bucketName,
      Key: `${this.folderName}/${key}`,
      Body: fileBuffer,
    };

    const upload = new Upload({
      client: this.s3,
      params,
    });

    return new Promise((resolve, reject) => {
      upload.on('httpUploadProgress', (progress) => {
        this.logger.log({
          progress: progress.loaded / progress.total,
        });
      });
      upload
        .done()
        .then(() => {
          resolve({
            url: `https://${this.bucketName}.s3.amazonaws.com/${key}`,
            key: key,
            folder: this.folderName,
            bucketName: this.bucketName,
          });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async generateSignedUrl(key: string) {

    // get url from cache if it exists
    const urlCached = await this.cacheManager.get(key);

    if (urlCached) {
      return String(urlCached);
    }

    // get url from s3
    const params = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: `${this.folderName}/${key}`,
    });


    const url = await getSignedUrl(this.s3, params, {
      expiresIn: 3600,
      signingDate: new Date(),
      signingService: 's3',
    });

    // set url in cache
    await this.cacheManager.set(key, url, 3600 * 1000);
    
    // return url
    return url;
  }

  async deleteFile(key: string) {
    return this.s3
      .send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: `${this.folderName}/${key}`,
        }),
      )
      .catch((err) => {
        this.logger.error(err);
        throw err;
      });
  }
}
