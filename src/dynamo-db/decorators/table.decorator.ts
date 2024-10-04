import 'reflect-metadata';

const TABLE_METADATA_KEY = Symbol('table');

export function Table(tableName: string): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(TABLE_METADATA_KEY, tableName, target.prototype);
  };
}

export function getTable(target: object): string | undefined {
  return Reflect.getMetadata(TABLE_METADATA_KEY, target) || undefined;
}
