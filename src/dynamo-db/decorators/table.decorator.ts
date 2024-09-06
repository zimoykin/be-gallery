import 'reflect-metadata';

const TABLE_METADATA_KEY = Symbol('table');

export function Table(tableName: string): ClassDecorator {
    return (target: Function) => {
        Reflect.defineMetadata(TABLE_METADATA_KEY, tableName, target.prototype);
    };
}


export function getTable(target: Object): string | undefined {
    return Reflect.getMetadata(TABLE_METADATA_KEY, target) || undefined;
}
