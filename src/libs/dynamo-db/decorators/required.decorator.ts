import 'reflect-metadata';

const REQUIRED_METADATA_KEY = Symbol('requiredKey');

export function Required(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const indexes = Reflect.getMetadata(REQUIRED_METADATA_KEY, target) || [];
    indexes.push(propertyKey);
    Reflect.defineMetadata(REQUIRED_METADATA_KEY, indexes, target);
  };
}

export function getRequired(target: object): string {
  return Reflect.getMetadata(REQUIRED_METADATA_KEY, target) || [];
}
