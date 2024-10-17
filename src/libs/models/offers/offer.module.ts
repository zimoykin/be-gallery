import { Module } from "@nestjs/common";
import { Offer, OfferSchema } from "./offer.model";
import { OfferRepository } from "./offer.repository";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
    imports: [MongooseModule.forFeature([{
        name: Offer.name,
        schema: OfferSchema
    }])],
    providers: [OfferRepository],
    exports: [OfferRepository]
})
export class OfferDatabaseModule { }