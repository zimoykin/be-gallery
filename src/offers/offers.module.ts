import { Module } from '@nestjs/common';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { DynamodbModule } from 'src/dynamo-db/dynamo-db.module';
import { Offer } from './models/offer.model';
import { offers } from './models/offer.seed';
import { profiles } from 'src/profiles/models/profile.seed';

@Module({
  imports: [
    DynamodbModule.forFeature(Offer, {
      seeding: () => {
        return offers('').map((offer) => {
          return {
            ...offer,
            profileId: profiles[Math.floor(Math.random() * profiles.length)].id,
          };
        });
      },
    }),
  ],
  providers: [OffersService],
  controllers: [OffersController],
})
export class OffersModule {}
