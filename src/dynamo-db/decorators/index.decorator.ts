import 'reflect-metadata';

const INDEX_METADATA_KEY = Symbol('index');

export function Index(): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const indices = Reflect.getMetadata(INDEX_METADATA_KEY, target) || [];
        indices.push(propertyKey);
        Reflect.defineMetadata(INDEX_METADATA_KEY, indices, target);
    };
}

export function getIndexes(target: Object): (string | symbol)[] {
    return Reflect.getMetadata(INDEX_METADATA_KEY, target) || [];
}