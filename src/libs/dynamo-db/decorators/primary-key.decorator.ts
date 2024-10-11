import 'reflect-metadata';

const PRIMARYT_METADATA_KEY = Symbol('primaryKey');

export function PrimaryKey(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    let primaryKey =
      Reflect.getMetadata(PRIMARYT_METADATA_KEY, target) || undefined;
    primaryKey = propertyKey;
    Reflect.defineMetadata(PRIMARYT_METADATA_KEY, primaryKey, target);
  };
}

export function getPrimaryKey(target: object): string {
  return Reflect.getMetadata(PRIMARYT_METADATA_KEY, target) || undefined;
}
