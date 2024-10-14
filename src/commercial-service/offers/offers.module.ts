import { Module } from '@nestjs/common';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { OffersPublicController } from './offers-public.controller';
import { OfferDatabaseModule } from '../../libs/models/offers/offer.module';
import { S3BucketModule } from '../../libs/s3-bucket/s3-bucket.module';
import { ImageCompressorModule } from '../../libs/image-compressor/image-compressor.module';

@Module({
  imports: [
    OfferDatabaseModule,
    S3BucketModule.forFeature('offers-preview'),
    S3BucketModule.forFeature('offers-compressed'),
    ImageCompressorModule
  ],
  providers: [OffersService],
  controllers: [OffersController, OffersPublicController],
})
export class OffersModule { }
