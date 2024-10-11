import { Module } from "@nestjs/common";
import { DynamodbModule } from "../../../libs/dynamo-db";
import { Folder } from "./folder.model";
import { FolderRepository } from "./folder.repository";

@Module({
    imports: [DynamodbModule.forFeature(Folder)],
    providers: [FolderRepository],
    exports: [FolderRepository]
})
export class FolderDatabaseModule { }