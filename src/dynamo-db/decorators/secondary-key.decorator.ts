import 'reflect-metadata';

const SORT_METADATA_KEY = Symbol('sortKey');

export function SortKey(): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        let sortKey = Reflect.getMetadata(SORT_METADATA_KEY, target) || undefined;
        sortKey = propertyKey;
        Reflect.defineMetadata(SORT_METADATA_KEY, sortKey, target);
    };
}

export function getSortKey(target: Object): (string | symbol)[] {
    return Reflect.getMetadata(SORT_METADATA_KEY, target) || [];
}