import 'reflect-metadata';

const INDEX_METADATA_KEY = Symbol('dynamo_dv_index');

export function Index(type: 'N' | 'S'): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const indexes = Reflect.getMetadata(INDEX_METADATA_KEY, target) || [];
    indexes.push({ indexName: propertyKey, type: type });
    Reflect.defineMetadata(INDEX_METADATA_KEY, indexes, target);
  };
}

export function getIndexes(
  target: object,
): { indexName: string; type: 'N' | 'S' }[] {
  return Reflect.getMetadata(INDEX_METADATA_KEY, target) || [];
}
