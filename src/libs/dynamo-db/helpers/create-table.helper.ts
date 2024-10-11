import {
  AttributeDefinition,
  DynamoDB,
  KeySchemaElement,
  LocalSecondaryIndex,
} from '@aws-sdk/client-dynamodb';
import { Logger } from '@nestjs/common';

const logger = new Logger('DynamoDB: table creation');
export async function createTable(
  connection: DynamoDB,
  tableName: string,
  primaryKey: string,
  sortKey?: [string, 'N' | 'S' | 'B'],
  indexes?: { indexName: string; type: 'N' | 'S' | 'B'; }[],
) {
  if (!tableName) {
    throw new Error('Table name is not defined');
  }

  try {
    const tables = await connection.listTables();
    if (tables.TableNames?.includes(tableName)) {
      return false;
    }
    return false;
  } catch (error) {
    logger.error(error);
  }

  if (!primaryKey) {
    throw new Error(
      `Primary key ${primaryKey} is not exists for table ${tableName}`,
    );
  }

  const _AttributeDefinitions: AttributeDefinition[] = [
    {
      AttributeName: String(primaryKey),
      AttributeType: 'S', //TODO: type?
    },
  ];

  if (sortKey) {
    _AttributeDefinitions.push({
      AttributeName: sortKey[0],
      AttributeType: sortKey[1],
    });
  } else {
    //use default sort key: createdAt
    _AttributeDefinitions.push({
      AttributeName: 'createdAt',
      AttributeType: 'N',
    });
  }

  for (const { indexName, type } of indexes ?? []) {
    _AttributeDefinitions.push({
      AttributeName: String(indexName),
      AttributeType: type,
    });
  }

  const _LocalSecondaryIndexes: LocalSecondaryIndex[] = [];

  for (const { indexName } of indexes ?? []) {
    _LocalSecondaryIndexes.push({
      IndexName: `${String(indexName)}_Index`,
      KeySchema: [
        {
          AttributeName: String(primaryKey),
          KeyType: 'HASH',
        },
        {
          AttributeName: String(indexName),
          KeyType: 'RANGE',
        },
      ],
      Projection: {
        ProjectionType: 'ALL',
      },
    });
  }

  const keySchema: KeySchemaElement[] = [
    {
      AttributeName: String(primaryKey),
      KeyType: 'HASH',
    },
  ];

  if (sortKey) {
    keySchema.push({
      AttributeName: String(sortKey[0]),
      KeyType: 'RANGE',
    });
  } else {
    //use default sort key: createdAt
    keySchema.push({
      AttributeName: 'createdAt',
      KeyType: 'RANGE',
    });
  }

  await connection.createTable({
    TableName: tableName,
    AttributeDefinitions: _AttributeDefinitions,
    KeySchema: keySchema,
    LocalSecondaryIndexes: _LocalSecondaryIndexes?.length
      ? _LocalSecondaryIndexes
      : undefined,
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
    StreamSpecification: {
      StreamEnabled: false,
    },
  });

  logger.debug(`Table ${tableName} is created`);

  return true;
}
