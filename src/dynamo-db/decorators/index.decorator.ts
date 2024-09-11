import 'reflect-metadata';

const INDEX_METADATA_KEY = Symbol('dynamo_dv_index');
const INDEX_TYPE_METADATA_KEY = Symbol('dynamo_dv_index_type');

export function Index(type: 'N' | 'S'): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const indexes = Reflect.getMetadata(INDEX_METADATA_KEY, target) || [];
    indexes.push({ indexName: propertyKey, type: type });
    Reflect.defineMetadata(INDEX_METADATA_KEY, indexes, target);
  };
}

export function getIndexes(
  target: Object,
): { indexName: string; type: 'N' | 'S' }[] {
  return Reflect.getMetadata(INDEX_METADATA_KEY, target) || [];
}
