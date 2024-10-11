import { Module } from '@nestjs/common';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { OffersPublicController } from './offers-public.controller';
import { DynamodbModule } from '../dynamo-db/dynamo-db.module';
import { Offer } from './models/offer.model';

@Module({
  imports: [
    DynamodbModule.forFeature(Offer),
  ],
  providers: [OffersService],
  controllers: [OffersController, OffersPublicController],
})
export class OffersModule { }
