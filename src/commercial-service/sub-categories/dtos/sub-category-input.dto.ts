import { IsIn, IsObject, IsString } from "class-validator";
import { Language, ServiceCategory } from "../../../libs/models/offers/offer-category.enum";
import { IsLocaleObject } from "./locale-validate.helper";

export class SubCategoryInputDto {
    @IsString()
    title: string;

    @IsObject()
    @IsLocaleObject()
    locale: {
        [key in Language]: string
    };

    @IsString()
    @IsIn(Object.keys(ServiceCategory))
    category: keyof typeof ServiceCategory;
}