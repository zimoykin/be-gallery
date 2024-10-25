import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigVariables, serviceSchema } from './service-config';
import { FolderModule } from './profile-service/folders/folder.module';
import { DynamodbModule } from './libs/dynamo-db/dynamo-db.module';
import { JwtModule } from '@zimoykin/auth';
import { PhotoModule } from './photo-service/photos/photo.module';
import { S3BucketModule } from './libs/s3-bucket/s3-bucket.module';
import { ImageCompressorModule } from './libs/image-compressor/image-compressor.module';
import { ProfileModule } from './profile-service/profiles/profile.module';
import { ProfileAuthMiddleware } from './libs/profile-cookie/middlewares/profile-auth.middleware';
import { TopicModule } from './commercial-service/topics/topic.module';
import { LikesModule } from './photo-service/likes/likes.module';
import { AmqpModule } from './libs/amqp/amqp.module';
import { SeedingModule } from './seeding/seeding.module';
import { MongooseModule } from '@nestjs/mongoose';
import { OffersModule } from './commercial-service/offers/offers.module';
import { MessagesModule } from './chat-service/messages.module';
import { EquipmentModule } from './profile-service/equipments/equipment.module';
import { SettingsModule } from './commercial-service/settings/settings.module';
import { LoggerModule } from 'nestjs-pino';
import { SubCategoryModule } from './commercial-service/sub-categories/sub-category.module';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<ConfigVariables>) => {
        return {
          pinoHttp: {
            level: config.get<string>('LOG_LEVEL') || 'info',
            transport: {
              target: 'pino-pretty',
              options: {
                useLevelLabels: true,
                colorize: true,
                levelFirst: true,
                ignore: 'pid,hostname',
                singleLine: true,
              },
            },
          },
        };
      },
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService<ConfigVariables>) => {
        const uri = config.get<string>('MONGO_CONNECTION')!;
        return { uri };

      }, inject: [ConfigService]
    }),
    AmqpModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<ConfigVariables>) => {
        const url = config.get('RMQ_URL')!;
        return { url };
      },
    }),
    JwtModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<ConfigVariables>) => ({
        secret: configService.get('JWT_SECRET')!,
      }),
    }),
    DynamodbModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService<ConfigVariables>) => {
        const AWS_REGION = config.get<string>('AWS_REGION')!;
        const AWS_ACCESS_KEY_ID = config.get<string>('AWS_ACCESS_KEY_ID')!;
        const AWS_SECRET_ACCESS_KEY = config.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        )!;

        return {
          region: AWS_REGION.trim(),
          credentials: {
            accessKeyId: AWS_ACCESS_KEY_ID.trim(),
            secretAccessKey: AWS_SECRET_ACCESS_KEY.trim(),
          },
          prefixCollection: 'gallery',
        };
      },
      inject: [ConfigService],
    }),
    S3BucketModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<ConfigVariables>) => {
        const AWS_REGION = config.get<string>('AWS_REGION')!;
        const AWS_ACCESS_KEY_ID = config.get<string>('AWS_ACCESS_KEY_ID')!;
        const AWS_SECRET_ACCESS_KEY = config.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        )!;
        const AWS_BUCKET_NAME = config.get<string>('S3_BUCKET_NAME')!;

        return {
          region: AWS_REGION,
          accessKeyId: AWS_ACCESS_KEY_ID,
          secretAccessKey: AWS_SECRET_ACCESS_KEY,
          bucketName: AWS_BUCKET_NAME,
        };
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: serviceSchema,
    }),
    FolderModule,
    PhotoModule,
    S3BucketModule,
    ImageCompressorModule,
    ProfileModule,
    OffersModule,
    TopicModule,
    MessagesModule,
    EquipmentModule,
    LikesModule,
    SeedingModule,
    SettingsModule,
    SubCategoryModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ProfileAuthMiddleware)
      .exclude('/api/v1/public/(.*)')
      .forRoutes('*');
  }
}
