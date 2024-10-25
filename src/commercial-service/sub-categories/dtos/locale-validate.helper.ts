import { registerDecorator, ValidationArguments } from "class-validator";
import { ValidationOptions } from "joi";
import { Language } from "../../../libs/models/offers/offer-category.enum";

/**
 * Validation decorator that checks if the given object is a locale object.
 * A locale object is an object that has all the keys of the Language enum and the values are strings.
 * @param validationOptions The validation options to be passed to the decorator.
 * @returns A function that will be called with the object and the property name as arguments.
 */
export function IsLocaleObject(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isLocaleObject',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (typeof value !== 'object' || Array.isArray(value)) return false;

                    const requiredLanguages = Object.values(Language);
                    return requiredLanguages.every((lang) => lang in value && typeof value[lang] === 'string');
                },
                defaultMessage() {
                    return `Locale must contain translations for all required languages: ${Object.values(Language).join(', ')}`;
                },
            },
        });
    };
}