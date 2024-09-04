import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigVariables, serviceSchema } from './service-config';
import { MongooseModule } from '@nestjs/mongoose';
import { FolderModule } from './folder/folder.module';
import { DynamodbModule } from './dynamo-db/dynamo-db.module';

@Module({
  imports: [
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
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: serviceSchema
    }),
    FolderModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
