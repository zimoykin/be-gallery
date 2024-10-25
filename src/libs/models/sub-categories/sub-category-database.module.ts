import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import SubCategory from "./sub-category.model";
import { SubCategoryRepository } from "./sub-category.repository";

@Module({
    imports: [MongooseModule.forFeature([SubCategory])],
    providers: [SubCategoryRepository],
    exports: [SubCategoryRepository],
})
export class SubCategoryDatabaseModule { }