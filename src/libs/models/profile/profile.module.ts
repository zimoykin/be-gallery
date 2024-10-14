import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";
import { ProfileRepository } from "./profile.repository";
import { Profile, ProfileSchema } from "./profile.model";

@Module({
    imports: [
        MongooseModule.forFeature([{
            name: Profile.name,
            schema: ProfileSchema
        }])
    ],
    providers: [
        ProfileRepository
    ],
    exports: [
        ProfileRepository
    ],
})
export class ProfileDatabaseModule { }