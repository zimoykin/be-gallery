import { Module } from "@nestjs/common";
import { DynamodbModule } from "src/libs/dynamo-db";
import { Profile } from "./profile.model";
import { ProfileRepository } from "./profile.repository";

@Module({
    imports: [
        DynamodbModule.forFeature(Profile),
    ],
    providers: [
        ProfileRepository,
    ],
    exports: [
        ProfileRepository
    ],
})
export class ProfileDatabaseModule { }