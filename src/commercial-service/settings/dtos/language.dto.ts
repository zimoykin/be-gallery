import { IsEnum, IsOptional, IsString } from "class-validator";
import { Language } from "../../../libs/models/offers/offer-category.enum";

export class LanguageDto {
    @IsString()
    @IsOptional()
    @IsEnum(Language)
    lang: Language;
}