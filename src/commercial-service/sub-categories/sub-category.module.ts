import { Module } from "@nestjs/common";
import { SubCategoryDatabaseModule } from "../../libs/models/sub-categories/sub-category-database.module";
import { SubCategoryService } from "./sub-category.service";
import { SubCategoryController } from "./sub-category.controller";

@Module({
    imports: [SubCategoryDatabaseModule],
    providers: [SubCategoryService],
    controllers: [SubCategoryController]
})
export class SubCategoryModule { }