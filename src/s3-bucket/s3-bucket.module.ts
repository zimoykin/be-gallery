import { DynamicModule, Module } from '@nestjs/common';
import {
  S3Client,
  CreateBucketCommand,
  ListBucketsCommand,
} from '@aws-sdk/client-s3';
import { S3BucketService } from './s3-bucket.service';
import { getBucketToken } from './get-bucket-token.helper';
import { CacheModule } from '@nestjs/cache-manager';

interface S3BucketModuleOptions {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

interface S3BucketModuleOptionsAsync {
  useFactory: (args: any) => S3BucketModuleOptions;
  inject: any[];
  imports: any[];
}

@Module({
  imports: [CacheModule.register({ isGlobal: true })],
})
export class S3BucketModule {
  private static client: S3Client;
  private static bucketName: string;

  private static async makeConnection(opts: S3BucketModuleOptions) {
    if (!this.client) {
      this.client = new S3Client({
        region: opts.region,
        credentials: {
          accessKeyId: opts.accessKeyId,
          secretAccessKey: opts.secretAccessKey,
        },
      });

      this.bucketName = opts.bucketName;

      const list = await this.client.send(new ListBucketsCommand({}));
      if (!list.Buckets?.find((b) => b.Name === opts.bucketName)) {
        await this.createBucket(opts);
      }
      return this.client;
    }
  }

  private static async createBucket(opts: S3BucketModuleOptions) {
    const command = new CreateBucketCommand({ Bucket: opts.bucketName });
    await this.client.send(command);
  }

  static forRoot(opts: S3BucketModuleOptions): DynamicModule {
    const client = this.makeConnection(opts);
    return {
      module: S3BucketModule,
      providers: [
        {
          provide: 'S3_BUCKET_CONNECTION',
          useValue: client,
        },
      ],
      exports: ['S3_BUCKET_CONNECTION'],
      global: true,
    };
  }
  static forRootAsync(opts: S3BucketModuleOptionsAsync) {
    return {
      module: S3BucketModule,
      providers: [
        {
          provide: 'S3_BUCKET_CONNECTION',
          useFactory: async (args: S3BucketModuleOptions) => {
            const config = opts.useFactory(args);
            return await this.makeConnection(config);
          },
          inject: opts.inject,
        },
        {
          provide: 'S3_BUCKET_NAME',
          useFactory: async (args: S3BucketModuleOptions) => {
            const config = opts.useFactory(args);
            return config.bucketName;
          },
          inject: opts.inject,
        },
      ],
      exports: ['S3_BUCKET_CONNECTION', 'S3_BUCKET_NAME'],
      global: true,
    };
  }
  static forFeature(folderName: string): DynamicModule {
    return {
      module: S3BucketModule,
      providers: [
        {
          provide: 'S3_FOLDER_NAME',
          useValue: folderName,
        },
        {
          provide: getBucketToken(folderName),
          useClass: S3BucketService,
        },
      ],
      exports: ['S3_FOLDER_NAME', getBucketToken(folderName)],
    };
  }
}
