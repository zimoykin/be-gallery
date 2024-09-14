import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { IConnection } from './dynamo-db.interfaces';
import { getIndexes } from './decorators/index.decorator';
import {
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

@Injectable()
export class DynamoDbRepository implements OnModuleInit {
  private readonly logger: Logger = new Logger(DynamoDbRepository.name);

  constructor(
    @Inject('DYNAMO-DB-CONNECTION') private readonly connection: IConnection,
    @Inject('DYNAMO-DB-MODEL') private readonly modelCls: new () => any,
  ) { }

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

  private transfromDataToObject(marschalledData: any) {
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
  private buildFilterExpression(filter: IScanFilter): { filterExpression: string; expressionAttributeValues: Record<string, AttributeValue>; } {

    const filterExpression = [];
    const expressionAttributeValues = {};

    const index = [
      ...getIndexes(this.modelCls),
      getSortKey(this.modelCls)[0],
      getPrimaryKey(this.modelCls),
    ];

    if (filter) {
      for (const [key, value] of Object.entries(filter)) {
        switch (key) {
          case 'match': {
            for (const [k, v] of Object.entries(value)) {
              if (index.includes(k)) {
                filterExpression.push(`${k} = :${k}`);
                expressionAttributeValues[`:${k}`] = v;
              }
            }
            break;
          }
          //TODO: check
          case 'contains': {
            for (const [k, v] of Object.entries(value)) {
              if (index.includes(k)) {
                filterExpression.push(`contains(${k}, :${k})`);
                expressionAttributeValues[`:${k}`] = v;
              }
            }
            break;
          }
          //TODO: add more
        }
      }
    }

    return {
      filterExpression: filterExpression.join(' AND '),
      expressionAttributeValues: marshall(expressionAttributeValues)
    };

  }

  /**
   * Reads all records from the DynamoDB table that match the given filter.
   *
   * @param filter The filter to apply to the records. If not provided, it will return all records.
   * @param indexName The name of the secondary index to query. If not provided, it will query the primary table.
   * @returns A Promise resolving to an array of records.
   */
  async readByFilter<T>(
    filter?: IScanFilter,
    indexName?: string, //TODO: investigate
  ): Promise<T[]> {

    const { filterExpression, expressionAttributeValues } = this.buildFilterExpression(filter);

    return this.connection.db
      .scan({
        TableName: this.getTableName(),
        FilterExpression: filterExpression,
        ExpressionAttributeValues: expressionAttributeValues
      })
      .then((data) => {
        const result = data.Items?.map((item) =>
          this.transfromDataToObject(item),
        );
        return result as T[];
      })
      .catch((err) => {
        this.logger.debug(err);
        throw err;
      });

  }

  /**
   * Counts the number of records in the DynamoDB table that match the given filter.
   *
   * @param filter The filter to apply to the records. If not provided, it will count all records.
   * @param indexName The name of the secondary index to query. If not provided, it will query the primary table.
   * @returns A Promise resolving to the count.
   */
  async countByFilter(
    filter?: IScanFilter,
    indexName?: string, //TODO: investigate
  ): Promise<number> {

    const { filterExpression, expressionAttributeValues } = this.buildFilterExpression(filter);

    return this.connection.db
      .scan({
        TableName: this.getTableName(),
        FilterExpression: filterExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        Select: 'COUNT'
      })
      .then((data) => {
        return data.Count ?? 0;
      })
      .catch((err) => {
        this.logger.debug(err);
        throw err;
      });

  }
  /**
   * Finds a record by its id.
   * @param id - The id to search for.
   * @throws {Error} - If no record is found.
   * @returns A Promise resolving to the found record.
   */
  async findById(id: string) {
    const primaryKey = getPrimaryKey(this.modelCls);
    const filter = {};
    const expression = `${primaryKey} = :${primaryKey}`;
    filter[`:${primaryKey}`] = id;

    return this.connection.db
      .scan({
        TableName: this.getTableName(),
        FilterExpression: expression,
        ExpressionAttributeValues: marshall(filter),
      })
      .then((data) => {
        if (data.Items.length === 0) {
          throw new Error('not found');
        } else {
          return this.transfromDataToObject(data.Items[0]);
        }
      })
      .catch((err) => {
        this.logger.debug(err);
      });
  }


  async findOneByFilter<T>(filter: IScanFilter): Promise<T> {
    return this.readByFilter(filter).then((data) => {
      if (data.length === 0) {
        throw new Error('not found');
      } else {
        return data[0] as T;
      }
    });
  }

  /**
   * Creates a new record in DynamoDB.
   * @param data - The data to save.
   * @throws {Error} - If the sort key is not exists in the data object.
   * @throws {Error} - If any required property is not exists in the data object.
   * @returns A Promise resolving to the created record.
   */
  async create<T>(data: T): Promise<T> {
    const indexes = getIndexes(this.modelCls);
    const [sortKey, typeSortKey] = getSortKey(this.modelCls);
    const primaryKey = getPrimaryKey(this.modelCls);
    const required = getRequired(this.modelCls) || [];

    if (data[String(sortKey)] === undefined) {
      throw new Error(`Sort key ${sortKey} is not exists`);
    }

    //check required properties
    for (const index of required) {
      if (data[index] === undefined) {
        throw new Error(`${index} is required`);
      }
    }

    const primaryId = uuidv4();
    const sortKeyValue = data[String(sortKey)]
      ? data[String(sortKey)]
      : Date.now();
    const record = {
      [primaryKey]: primaryId,
      [String(sortKey)]: sortKeyValue,
      data: data,
    };

    for (const { indexName, type } of indexes) {
      if (data[indexName]) {
        record[String(indexName)] = data[indexName];
      }
    }
    await this.connection.db.send(
      new PutCommand({
        TableName: this.getTableName(),
        Item: record,
      }),
    );
    return this.findById(primaryId);
  }

  async update(id: string, data: any) {
    const existingRecord = await this.findById(id);

    if (!existingRecord) {
      throw new Error('not found');
    }

    const indexes = getIndexes(this.modelCls);
    const [sortKey, type] = getSortKey(this.modelCls);
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

    for (const { indexName, type } of indexes) {
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
    const updateExpression = [];

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

    return this.findById(id);
  }

  async remove(id: string) {
    const primaryKey = getPrimaryKey(this.modelCls);
    const [sortKey, type] = getSortKey(this.modelCls);
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
