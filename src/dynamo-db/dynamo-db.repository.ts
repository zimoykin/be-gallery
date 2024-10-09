import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  Optional,
} from '@nestjs/common';
import { IConnection } from './dynamo-db.interfaces';
import { getIndexes } from './decorators/index.decorator';
import {
  BatchWriteCommand,
  DeleteCommand,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { getSortKey } from './decorators/sort-key.decorator';
import { IScanFilter } from './interfaces/scan-filter.interface';
import { getPrimaryKey } from './decorators/primary-key.decorator';
import { getTable } from './decorators/table.decorator';
import { createTable } from './helpers/create-table.helper';
import { getRequired } from './decorators/required.decorator';
import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { factoryConstructor } from './interfaces/factory.type';
import { toPlainObject } from 'lodash';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ModelClsT = new (...args: any[]) => any;

@Injectable()
export class DynamoDbRepository<T extends object> implements OnModuleInit {
  static updateCounter = 0;
  private readonly logger: Logger = new Logger(DynamoDbRepository.name);

  constructor(
    //@ts-ignore//
    @Inject('DYNAMO-DB-CONNECTION') private readonly connection: IConnection,
    //@ts-ignore//
    @Inject('DYNAMO-DB-MODEL')
    private readonly modelCls: ModelClsT
  ) { }

  /**
   * Returns the name of the DynamoDB table associated with this repository.
   * The name is derived from the table name decorator on the model class,
   * and is modified if the connection object has a prefixCollection property.
   * The table name is converted to lower case and trimmed.
   * If the table name is not defined, an error is thrown.
   * @returns The name of the DynamoDB table
   */
  private getTableName() {
    let tableName = getTable(this.modelCls);
    if (!tableName) {
      throw new Error(`Table name is not defined for ${this.modelCls.name}`);
    }
    if (this.connection.prefixCollection) {
      tableName = `${this.connection.prefixCollection
        .toLowerCase()
        .trim()}_${tableName.toLowerCase().trim()}`;
    }
    return tableName;
  }
  async onModuleInit() {
    await createTable(
      this.connection.db,
      this.getTableName(),
      getPrimaryKey(this.modelCls),
      getSortKey(this.modelCls),
      getIndexes(this.modelCls),
    );
  }

  private transfromDataToObject(
    marschalledData: Record<string, AttributeValue>,
  ) {
    const data = unmarshall(marschalledData);
    const primaryKey = getPrimaryKey(this.modelCls);
    const [sortKey] = getSortKey(this.modelCls);

    return {
      [primaryKey]: data[primaryKey],
      [sortKey]: data[sortKey],
      ...data.data,
    };
  }

  /**
   * Builds a filter expression for a DynamoDB scan operation.
   * @param filter An object with filter operations.
   * @returns An object with the filter expression and its attribute values.
   * The filter expression is a string that contains the operations joined by ' AND '.
   * The attribute values is an object with the same keys as the filter operations,
   * and the values are the values of the filter operations.
   * The attribute values are marshalled to DynamoDB attribute values.
   */
  private buildFilterExpression(filter?: IScanFilter<T>): {
    filterExpression: string;
    expressionAttributeValues: Record<string, AttributeValue>;
  } {
    const filterExpression: string[] = [];
    const filterORExpression: string[] = [];
    const expressionAttributeValues = {};

    const index = [
      ...getIndexes(this.modelCls).map(({ indexName }) => indexName),
      getSortKey(this.modelCls)[0],
      getPrimaryKey(this.modelCls),
    ];

    if (filter) {
      Object.entries(filter).forEach(([key, value], ind) => {
        switch (key) {
          case 'match': {
            Object.entries(value).forEach(([k, v], indCond) => {
              if (index.includes(k)) {
                const key = `${ind}_${indCond}_${k}`;
                filterExpression.push(`${k} = :${key}`);
                expressionAttributeValues[`:${key}`] = v;
              }
            });
            break;
          }
          case 'or': {
            Object.entries(value).forEach(([k, v], indCond) => {
              if (index.includes(k)) {
                if (Array.isArray(v)) {
                  v?.forEach((val, index) => {
                    const key = `${ind}_${indCond}_${k}_${index}`;
                    filterORExpression.push(`(${k} = :${key})`);
                    expressionAttributeValues[`:${key}`] = val;
                  });
                } else {
                  const key = `${ind}_${indCond}_${k}`;
                  filterORExpression.push(`(${k} = :${key})`);
                  expressionAttributeValues[`:${key}`] = v;
                }
              }
            });
            break;
          }
          //TODO: check
          case 'contains': {
            Object.entries(value).forEach(([k, v], indCond) => {
              if (index.includes(k)) {
                const key = `${ind}_${indCond}_${k}`;
                filterExpression.push(`contains(${k}, :${key})`);
                expressionAttributeValues[`:${key}`] = v;
              }
            });
            break;
          }
          case 'gte': {
            Object.entries(value).forEach(([k, v], indCond) => {
              if (index.includes(k)) {
                const key = `${ind}_${indCond}_${k}`;
                filterExpression.push(`${k} >= :${key}`);
                expressionAttributeValues[`:${key}`] = v;
              }
            });
            break;
          }
          case 'lte': {
            Object.entries(value).forEach(([k, v], indCond) => {
              if (index.includes(k)) {
                const key = `${ind}_${indCond}_${k}`;
                filterExpression.push(`${k} <= :${key}`);
                expressionAttributeValues[`:${key}`] = v;
              }
            });
            break;
          }
        }
      });
    }
    //merge filters or
    if (filterORExpression.length > 1)
      filterExpression.push(`( ${filterORExpression.join(' OR ')} )`);

    return {
      filterExpression: filterExpression.join(' AND '),
      expressionAttributeValues: marshall(expressionAttributeValues, {
        removeUndefinedValues: true,
      }),
    };
  }

  /**
   * Recursively removes undefined values from the given object.
   * It also supports arrays and nested objects.
   * @param data The object to remove undefined values from.
   * @returns The object with undefined values removed.
   */
  private plainObjectNested(data: object) {
    for (const [key, value] of Object.entries(data)) {
      if (value == undefined) {
        delete data[key];
      } else if (Array.isArray(value)) {
        data[key] = value.map((item) => ({
          ...this.plainObjectNested(item),
        }));
      } else if (typeof value === 'object') {
        data[key] = { ...this.plainObjectNested(value) };
      } else {
        data[key] = value;
      }
    }

    return data;
  }

  /**
   * Scans the DynamoDB table and applies the given filter expression to the records.
   * It uses the `ExclusiveStartKey` property to paginate through the records.
   * If a limit is provided, it will stop scanning and return the accumulated records once the limit is reached.
   * If no limit is provided, it will return all the records in the table.
   * @param filterExpression - The filter expression to apply to the records.
   * @param expressionAttributeValues - The values for the filter expression.
   * @param accumulator - The accumulated records. Defaults to an empty array.
   * @param lastKey - The last key to start the scan from. Defaults to an empty object.
   * @param limit - The maximum number of records to return. Defaults to `undefined`.
   * @returns A Promise resolving to an array of records.
   */
  private async scan(
    filterExpression: string,
    expressionAttributeValues: Record<string, AttributeValue>,
    indexName?: string,
    accumulator: T[] = [],
    lastKey?: Record<string, AttributeValue>,
    limit?: number,
  ) {
    DynamoDbRepository.updateCounter++;
    const result = await this.connection.db.scan({
      TableName: this.getTableName(),
      IndexName: indexName ? `${indexName}_Index` : undefined,
      FilterExpression: filterExpression?.length ? filterExpression : undefined,
      ExpressionAttributeValues: filterExpression?.length
        ? expressionAttributeValues
        : undefined,
      ExclusiveStartKey: lastKey || undefined,
    });

    const acc = [
      ...accumulator,
      ...(result.Items?.map((item) => this.transfromDataToObject(item)) ?? []),
    ];

    if (limit && acc.length >= limit) {
      return acc.splice(0, limit);
    }

    if (result.LastEvaluatedKey) {
      return this.scan(
        filterExpression,
        expressionAttributeValues,
        indexName,
        acc,
        result.LastEvaluatedKey,
        limit,
      );
    } else {
      return acc;
    }
  }

  /**
   * Reads all records from the DynamoDB table that match the given filter.
   *
   * @param filter The filter to apply to the records. If not provided, it will return all records.
   * @param indexName The name of the secondary index to query. If not provided, it will query the primary table.
   * @returns A Promise resolving to an array of records.
   */
  async find<K = T>(
    filter?: IScanFilter<T>,
    indexName?: string, //TODO: investigate
  ): Promise<K[]> {
    DynamoDbRepository.updateCounter++;
    this.logger.debug(`filtering ${this.getTableName()}: ${JSON.stringify(filter)}`);
    const { filterExpression, expressionAttributeValues } =
      this.buildFilterExpression(filter);
    return this.scan(
      filterExpression,
      expressionAttributeValues,
      indexName,
      [],
      undefined,
      filter?.limit,
    );
  }

  /**
   * Counts the number of records in the DynamoDB table that match the given filter.
   *
   * @param filter The filter to apply to the records. If not provided, it will count all records.
   * @param indexName The name of the secondary index to query. If not provided, it will query the primary table.
   * @returns A Promise resolving to the count.
   */
  async countByFilter(
    filter?: IScanFilter<T>,
    indexName?: string,
  ): Promise<number> {
    DynamoDbRepository.updateCounter++;
    const { filterExpression, expressionAttributeValues } =
      this.buildFilterExpression(filter);

    return this.connection.db
      .scan({
        TableName: this.getTableName(),
        IndexName: indexName ? `${indexName}_Index` : undefined,
        FilterExpression: filterExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        Select: 'COUNT',
      })
      .then((data) => {
        return data.Count ?? 0;
      })
      .catch((err) => {
        this.logger.error(err);
        throw err;
      });
  };
  /**
   * Finds a record by its id.
   * @param id - The id to search for.
   * @throws {Error} - If no record is found.
   * @returns A Promise resolving to the found record.
   */
  async findById<K = T>(id: string): Promise<K | null> {
    DynamoDbRepository.updateCounter++;
    this.logger.debug(`findById ${this.getTableName()}: ${id}`);
    const primaryKey = getPrimaryKey(this.modelCls);
    try {
      const result = await this.connection.db.query({
        TableName: this.getTableName(),
        KeyConditionExpression: `${primaryKey} = :id`,
        ExpressionAttributeValues: marshall({ ':id': id }),
        Limit: 1,
      });

      if (result?.Items?.length) {
        const item = result?.Items[0];
        return this.transfromDataToObject(item);
      } else {
        throw new NotFoundException(`not found ${id}`);
      }
    } catch (err) {
      this.logger.error(err);
      throw err; // Можно выбросить ошибку для обработки на более высоком уровне
    }
  }

  async findOneByFilter<K = T>(filter: IScanFilter<T>): Promise<K | null> {
    return this.find<K>({ ...filter, limit: 1 }).then((data: K[]) => {
      if (data?.length) return data[0];
      return null;
    });
  };

  /**
   * Generate a list of records from the given inputs for the given table.
   *
   * It will create a primary key if it is not present in the input,
   * and it will create a sort key if it is not present in the input.
   * create a record with the data from the input.
     create a record with the data from the input and the primary key and sort key.
     create a record with the data from the input and the primary key and sort key and the required properties.
   * return an array of records.
   *
   * @param inputs - The inputs to generate the records from.
   * @returns A Promise resolving to the generated records.
   */
  private async generateRecordDbByChunk(
    ...inputs: T[]
  ): Promise<Array<Array<Record<string, object | string | number | boolean>>>> {
    const indexes = getIndexes(this.modelCls);
    const [sortKey] = getSortKey(this.modelCls);
    const primaryKey = getPrimaryKey(this.modelCls);
    const required = getRequired(this.modelCls) || [];

    const records: {
      [x: string]: string | number | object;
      data: T;
    }[] = [];

    for (const item of inputs) {
      const primaryId = item[primaryKey] ?? uuidv4();
      const sortKeyValue = item[String(sortKey)]
        ? item[String(sortKey)]
        : Date.now();
      item[primaryKey] = primaryId;

      let data = factoryConstructor(this.modelCls)() as unknown as T;
      data = this.plainObjectNested(
        toPlainObject(Object.assign(data, item)),
      ) as T;

      const record = {
        [primaryKey]: primaryId,
        [String(sortKey)]: sortKeyValue,
        data: { ...data },
      };

      for (const { indexName } of indexes) {
        if (item[indexName] !== undefined) {
          record[String(indexName)] = item[indexName];
        }
      }

      if (record[String(sortKey)] === undefined) {
        throw new Error(`Sort key ${sortKey} is not exists`);
      }

      //check required properties
      for (const index of required) {
        if (data[index] === undefined) {
          throw new Error(`${index} is required`);
        }
      }
      records.push(record);
    }

    if (records?.length > 25) {
      const init = 0;
      const step = 25;
      const result: Array<
        Array<Record<string, object | string | number | boolean>>
      > = [];
      for (let i = init; i < records.length; i += step) {
        const chunk = records.slice(i, i + step);
        result.push(chunk);
      }

      return result;
    } else return [records];
  }
  /**
   * Creates a new record in DynamoDB.
   * @param data - The data to save.
   * @throws {Error} - If the sort key is not exists in the data object.
   * @throws {Error} - If any required property is not exists in the data object.
   * @returns A Promise resolving to the created record.
   */
  async create<K = T>(_data: Partial<T>): Promise<string> {
    DynamoDbRepository.updateCounter++;
    if (DynamoDbRepository.updateCounter === 25) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      DynamoDbRepository.updateCounter = 0;
    }
    this.logger.debug(`create ${this.getTableName()}: ${JSON.stringify(_data)}`);
    const indexes = getIndexes(this.modelCls);
    const [sortKey] = getSortKey(this.modelCls);
    const primaryKey = getPrimaryKey(this.modelCls);
    const required = getRequired(this.modelCls) || [];

    const primaryId = _data[primaryKey] ?? uuidv4();
    const sortKeyValue = _data[String(sortKey)]
      ? _data[String(sortKey)]
      : Date.now();
    _data[primaryKey] = primaryId;

    let data = factoryConstructor(this.modelCls)() as unknown as T;
    data = this.plainObjectNested(
      toPlainObject(Object.assign(data, _data)),
    ) as T;

    const record = {
      [primaryKey]: primaryId,
      [String(sortKey)]: sortKeyValue,
      data: { ...data },
    };

    for (const { indexName } of indexes) {
      if (data[indexName] !== undefined) {
        record[String(indexName)] = data[indexName];
      }
    }

    if (record[String(sortKey)] === undefined) {
      throw new Error(`Sort key ${sortKey} is not exists`);
    }

    //check required properties
    for (const index of required) {
      if (data[index] === undefined) {
        throw new Error(`${index} is required`);
      }
    }

    await this.connection.db.send(
      new PutCommand({
        TableName: this.getTableName(),
        Item: record,
        ReturnValues: 'NONE'
      }),
    );

    return primaryId;
  }
  async batchWrite(records: T[]) {
    DynamoDbRepository.updateCounter++;
    const chunks = await this.generateRecordDbByChunk(...records);
    const tableName = this.getTableName();

    chunks.forEach(async (chunk) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const batch: any[] = [];
      chunk.forEach((record) => {
        batch.push({
          PutRequest: {
            Item: record,
          },
        });
      });

      await this.connection.db
        .send(
          new BatchWriteCommand({
            ReturnConsumedCapacity: 'TOTAL',
            RequestItems: {
              [tableName]: batch,
            },
          }),
        )
        .then(() => {
          this.logger.log(`Batch write: ${JSON.stringify(chunk)}`);
        })
        .catch((err) => {
          this.logger.error(err);
          throw err;
        });
      //we have to wait aws limit 25 records per second
      await new Promise((resolve) => setTimeout(resolve, 3000));
    });
  }

  async update(id: string, _data: object) {
    DynamoDbRepository.updateCounter++;
    if (DynamoDbRepository.updateCounter === 25) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      DynamoDbRepository.updateCounter = 0;
    }
    this.logger.debug(`update ${DynamoDbRepository.updateCounter} ${this.getTableName()}: ${id}: ${JSON.stringify(_data)}`);
    const existingRecord = await this.findById(id);

    if (!existingRecord) {
      throw new Error('not found');
    }

    const data = this.plainObjectNested(
      toPlainObject(Object.assign(existingRecord, _data)),
    ) as T;

    const indexes = getIndexes(this.modelCls);
    const [sortKey] = getSortKey(this.modelCls);
    const primaryKey = getPrimaryKey(this.modelCls);
    const required = getRequired(this.modelCls) || [];

    if (data[String(sortKey)] === undefined) {
      throw new Error(`Sort key ${sortKey} is not exists`);
    }

    const record = {
      [primaryKey]: id,
      [String(sortKey)]: data[String(sortKey)],
      data: data,
    };

    for (const { indexName } of indexes) {
      if (data[indexName] == undefined) {
        throw new Error(`${indexName} is required`);
      }
      record[String(indexName)] = data[indexName];
    }

    for (const index of required) {
      if (data[index] === undefined) {
        throw new Error(`${index} is required`);
      }
    }

    const expressionAttributeNames = {};
    const expressionAttributeValues = {};
    const updateExpression: string[] = [];

    for (const [k, v] of Object.entries(record)) {
      if (k === primaryKey || k === String(sortKey)) {
        continue;
      }
      expressionAttributeNames[`#${k}`] = k;
      expressionAttributeValues[`:${k}`] = v;
      updateExpression.push(`#${k} = :${k}`);
    }

    const update = new UpdateCommand({
      TableName: this.getTableName(),
      Key: {
        [primaryKey]: id,
        [String(sortKey)]: existingRecord[String(sortKey)],
      },
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: 'UPDATED_NEW',
      ExpressionAttributeValues: expressionAttributeValues,
      UpdateExpression: 'SET ' + updateExpression.join(', '),
    });

    await this.connection.db.send(update);
    return id;
  }

  //TODO: to be checked
  async updateByFilter<K = T>(filter: IScanFilter<T>, _data: object) {
    const records = await this.find(filter);
    const data = records.map((record) =>
      this.plainObjectNested(toPlainObject(Object.assign(record, _data))),
    ) as K[];
    const indexes = getIndexes(this.modelCls);
    const [sortKey] = getSortKey(this.modelCls);
    const primaryKey = getPrimaryKey(this.modelCls);
    const required = getRequired(this.modelCls) || [];

    for await (const model of data) {
      if (model[String(sortKey)] === undefined) {
        throw new Error(`Sort key ${sortKey} is not exists`);
      }

      const record = {
        [primaryKey]: model[primaryKey],
        [String(sortKey)]: model[String(sortKey)],
        data: model,
      };

      for (const { indexName } of indexes) {
        if (model[indexName] == undefined) {
          throw new Error(`${indexName} is required`);
        }
        record[String(indexName)] = model[indexName];
      }

      for (const index of required) {
        if (model[index] === undefined) {
          throw new Error(`${index} is required`);
        }
      }

      const expressionAttributeNames = {};
      const expressionAttributeValues = {};
      const updateExpression: string[] = [];

      for (const [k, v] of Object.entries(record)) {
        if (k === primaryKey || k === String(sortKey)) {
          continue;
        }
        expressionAttributeNames[`#${k}`] = k;
        expressionAttributeValues[`:${k}`] = v;
        updateExpression.push(`#${k} = :${k}`);
      }

      const update = new UpdateCommand({
        TableName: this.getTableName(),
        Key: {
          [primaryKey]: record[primaryKey],
          [String(sortKey)]: record[String(sortKey)],
        },
        ExpressionAttributeNames: expressionAttributeNames,
        ReturnValues: 'NONE',
        ExpressionAttributeValues: expressionAttributeValues,
        UpdateExpression: 'SET ' + updateExpression.join(', '),
      });

      await this.connection.db.send(update);
    }

    return true;
  }

  /**
   * Deletes a record from DynamoDB.
   *
   * It first checks if the record exists. If it does not, it throws an error.
   * If it does, it deletes the record.
   * @param id - The id of the record to delete.
   * @throws {Error} - If the record is not found.
   * @returns A Promise resolving to the deleted record.
   */
  async remove(id: string) {
    this.logger.debug(`remove ${this.getTableName()} : ${id}`);
    const primaryKey = getPrimaryKey(this.modelCls);
    const [sortKey] = getSortKey(this.modelCls);
    const existingRecord = await this.findById(id);
    if (!existingRecord) {
      throw new Error('not found');
    }
    const deleteCommand = new DeleteCommand({
      TableName: this.getTableName(),
      Key: {
        [primaryKey]: id,
        [String(sortKey)]: existingRecord[String(sortKey)],
      },
    });
    await this.connection.db.send(deleteCommand);
    return existingRecord;
  }
}
