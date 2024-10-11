import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import Photo from "./photo.model";
import { PhotoRepository } from "./photo.repository";

@Module({
    imports: [
        MongooseModule.forFeature([Photo])
    ],
    providers: [PhotoRepository],
    exports: [PhotoRepository]
})
export class PhotoDatabaseModule { }