import { Module } from "@nestjs/common";
import { DynamodbModule } from "../../../libs/dynamo-db";
import { Like } from "./like.model";
import { LikeRepository } from "./like.repository";

@Module({
    imports: [
        DynamodbModule.forFeature(Like),
    ],
    providers:[LikeRepository],
    exports: [LikeRepository]

})
export class LikeDatabaseModule { }