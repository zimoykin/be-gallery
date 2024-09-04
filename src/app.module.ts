import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigVariables, serviceSchema } from './service-config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    // MongooseModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (config: ConfigService<ConfigVariables>) => {
    //     const uri = config.get('MONGO_CONNECTION');
    //     return { uri };
    //   }, inject: [ConfigService]
    // }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: serviceSchema
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
