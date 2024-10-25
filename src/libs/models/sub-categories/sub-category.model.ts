import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Language, ServiceCategory } from "../offers/offer-category.enum";

@Schema({
    timestamps: true,
    collection: 'gallery-sub-categories',
})
export class SubCategory {
    _id: string;

    @Prop({
        required: true,
        enum: [...Object.keys(ServiceCategory)]
    })
    category: string;

    @Prop({
        required: true
    })
    title: string;

    @Prop({
        required: true,
        /**
         * Validates the locale object to ensure that all keys are valid ServiceCategories.
         * @param value the locale object to validate
         * @returns true if the object is valid, false otherwise
         */
        validate: (value: Record<string, string>) => {
            Object.keys(value).forEach((key) => {
                if (Object.keys(ServiceCategory).indexOf(key) === -1) {
                    return false;
                }
            });
            return true;
        },
        type: {}
    })
    locale: {
        [key in Language]: string
    };
}

export const SubCategorySchema = SchemaFactory.createForClass(SubCategory).index({ title: 1, category: 1 }, { unique: true });
export type SubCategoryType = SubCategory & Document;

export default {
    schema: SubCategorySchema,
    name: SubCategory.name,
};