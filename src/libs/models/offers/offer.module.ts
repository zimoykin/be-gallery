import { Module } from "@nestjs/common";
import { DynamodbModule } from "src/libs/dynamo-db";
import { Offer } from "./offer.model";
import { OfferRepository } from "./offer.repository";

@Module({
    imports: [DynamodbModule.forFeature(Offer)],
    providers: [OfferRepository],
    exports: [OfferRepository]
})
export class OfferDatabaseModule { }