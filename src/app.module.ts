import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigVariables, serviceSchema } from './service-config';
import { MongooseModule } from '@nestjs/mongoose';
import { FolderModule } from './folder/folder.module';
import { DynamodbModule } from './dynamo-db/dynamo-db.module';
import { JwtModule } from '@zimoykin/auth';
import { PhotoModule } from './photo/photo.module';
import { S3BucketModule } from './s3-bucket/s3-bucket.module';
import { ImageCompressorModule } from './image-compressor/image-compressor.module';

@Module({
  imports: [
    JwtModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<ConfigVariables>) => ({
        secret: configService.get('JWT_SECRET')
      })
    }),
    DynamodbModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService<ConfigVariables>) => {
        const AWS_REGION = config.get<string>('AWS_REGION');
        const AWS_ACCESS_KEY_ID = config.get<string>('AWS_ACCESS_KEY_ID');
        const AWS_SECRET_ACCESS_KEY = config.get<string>('AWS_SECRET_ACCESS_KEY');

        return {
          region: AWS_REGION,
          credentials: {
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY
          },
          prefixCollection: 'gallery',
        };
      },
      inject: [ConfigService]
    }),
    S3BucketModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<ConfigVariables>) => {
        const AWS_REGION = config.get<string>('AWS_REGION');
        const AWS_ACCESS_KEY_ID = config.get<string>('AWS_ACCESS_KEY_ID');
        const AWS_SECRET_ACCESS_KEY = config.get<string>('AWS_SECRET_ACCESS_KEY');
        const AWS_BUCKET_NAME = config.get<string>('S3_BUCKET_NAME');

        return {
          region: AWS_REGION,
          accessKeyId: AWS_ACCESS_KEY_ID,
          secretAccessKey: AWS_SECRET_ACCESS_KEY,
          bucketName: AWS_BUCKET_NAME
        };
      }
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: serviceSchema
    }),
    FolderModule,
    PhotoModule,
    S3BucketModule,
    ImageCompressorModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
