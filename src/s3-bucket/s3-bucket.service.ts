import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3BucketService {
  private readonly logger = new Logger(S3BucketService.name);
  constructor(
    // @ts-ignore //
    @Inject('S3_BUCKET_NAME') private readonly bucketName: string,
    // @ts-ignore //
    @Inject('S3_FOLDER_NAME') private readonly folderName: string,
    // @ts-ignore //
    @Inject('S3_BUCKET_CONNECTION') private readonly s3: S3Client
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

  /**
   * Generate a signed url for a given key
   * @param key key of the object in s3
   * @returns {url: string, expiresIn: number} signed url and expiration time in milliseconds
   * @throws InternalServerError if there is an error generating the signed url
   */
  async generateSignedUrl(key: string): Promise<{ url: string; expiresIn?: number; }> {
    // get url from s3
    const params = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: `${this.folderName}/${key}`,
    });

    const expiresIn = 60 * 60 * 24 * 7; // 7 days, coz s3 requires

    const url = await getSignedUrl(this.s3, params, {
      expiresIn: expiresIn,
      signingDate: new Date(),
      signingService: 's3',
    });

    // return url
    return { url, expiresIn: new Date().setMilliseconds(expiresIn*1000) };
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
