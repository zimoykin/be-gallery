import 'reflect-metadata';

const INDEX_METADATA_KEY = Symbol('index');

export function Index(): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const indexes = Reflect.getMetadata(INDEX_METADATA_KEY, target) || [];
        indexes.push(propertyKey);
        Reflect.defineMetadata(INDEX_METADATA_KEY, indexes, target);
    };
}

export function getIndexes(target: Object): string[] {
    return Reflect.getMetadata(INDEX_METADATA_KEY, target) || [];
}