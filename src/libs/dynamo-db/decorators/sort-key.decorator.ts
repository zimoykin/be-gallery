import 'reflect-metadata';

const SORT_METADATA_KEY = Symbol('dynamo_db_sortKey');
const TYPE_SORT_METADATA_KEY = Symbol('dynamo_db_typeSortKey');

export function SortKey(type: 'N' | 'S'): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    let sortKey = Reflect.getMetadata(SORT_METADATA_KEY, target) || undefined;
    sortKey = propertyKey;
    Reflect.defineMetadata(SORT_METADATA_KEY, sortKey, target);
    Reflect.defineMetadata(TYPE_SORT_METADATA_KEY, type, target);
  };
}

export function getSortKey(target: object): [string, 'N' | 'S'] {
  return [
    Reflect.getMetadata(SORT_METADATA_KEY, target) || 'createdAt',
    Reflect.getMetadata(TYPE_SORT_METADATA_KEY, target) || 'N',
  ];
}
