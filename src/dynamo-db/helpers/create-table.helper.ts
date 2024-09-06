import { AttributeDefinition, DynamoDB, LocalSecondaryIndex } from "@aws-sdk/client-dynamodb";
import { Logger } from "@nestjs/common";

const logger = new Logger('DynamoDB: table creation');
export async function createTable(
    connection: DynamoDB,
    tableName: string,
    primaryKey: string,
    sortKey?: string,
    indexes?: string[]) {

    if (!tableName) {
        throw new Error('Table name is not defined');
    }

    const tables = await connection.listTables();
    if (tables.TableNames.includes(tableName)) {
        return;
    }

    if (!primaryKey) {
        throw new Error(`Primary key ${primaryKey} is not exists for table ${tableName}`);
    }

    const _AttributeDefinitions: AttributeDefinition[] = [{
        AttributeName: String(primaryKey),
        AttributeType: 'S'//TODO: type?
    },
    {
        AttributeName: String(sortKey),
        AttributeType: 'N' //TODO: type?
    }];

    for (const index of indexes) {
        _AttributeDefinitions.push({
            AttributeName: String(index),
            AttributeType: 'S'
        });
    }

    const _LocalSecondaryIndexes: LocalSecondaryIndex[] = [];

    for (const index of indexes) {
        _LocalSecondaryIndexes.push({
            IndexName: `${String(index)}_Index`,
            KeySchema: [
                {
                    AttributeName: String(primaryKey),
                    KeyType: 'HASH'
                },
                {
                    AttributeName: String(index),
                    KeyType: 'RANGE'
                }
            ],
            Projection: {
                ProjectionType: 'ALL'
            }
        });
    }


    await connection.createTable({
        TableName: tableName,
        AttributeDefinitions: _AttributeDefinitions,
        KeySchema: [
            {
                AttributeName: String(primaryKey),
                KeyType: 'HASH'
            },
            {
                AttributeName: String(sortKey),
                KeyType: 'RANGE'
            }
        ],
        LocalSecondaryIndexes: _LocalSecondaryIndexes,
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
        },
        StreamSpecification: {
            StreamEnabled: false
        }
    });

    logger.debug(`Table ${tableName} is created`);

}