// import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { IConnection } from "./dynamo-db.interfaces";
import { getIndexes } from "./decorators/index.decorator";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid';
import { AttributeDefinition, LocalSecondaryIndex, LocalSecondaryIndexDescription } from "@aws-sdk/client-dynamodb";
import { getSortKey } from "./decorators/secondary-key.decorator";

@Injectable()
export class DynamoDbRepository implements OnModuleInit {
    private readonly logger: Logger = new Logger(DynamoDbRepository.name);

    constructor(
        @Inject('DYNAMO-DB-CONNECTION') private readonly connection: IConnection,
        @Inject('DYNAMO-DB-TABLE-NAME') private readonly table: string,
        @Inject('DYNAMO-DB-MODEL') private readonly modelCls: new () => any,
    ) { }

    private getTableName() {
        let tableName = this.table;
        if (this.connection.prefixCollection) {
            tableName = `${this.connection.prefixCollection}_${tableName}`;
        }
        return tableName;
    }
    async onModuleInit() {

        const tables = await this.connection.db.listTables();
        if (tables.TableNames.includes(this.getTableName())) {
            return;
        }


        const sortKey = getSortKey(this.modelCls);
        const _AttributeDefinitions: AttributeDefinition[] = [{
            AttributeName: 'id',
            AttributeType: 'S'
        },
        {
            AttributeName: String(sortKey),
            AttributeType: 'N' //TODO: type?
        }];

        for (const index of getIndexes(this.modelCls)) {
            _AttributeDefinitions.push({
                AttributeName: String(index),
                AttributeType: 'S'
            });
        }

        const _LocalSecondaryIndexes: LocalSecondaryIndex[] = [];

        for (const index of getIndexes(this.modelCls)) {
            _LocalSecondaryIndexes.push({
                IndexName: `${String(index)}_Index`,
                KeySchema: [
                    {
                        AttributeName: 'id',
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


        await this.connection.db.createTable({
            TableName: this.getTableName(),
            AttributeDefinitions: _AttributeDefinitions,
            KeySchema: [
                {
                    AttributeName: 'id',
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

    }


    async read() {
        return this.connection.db.scan({
            TableName: this.getTableName(),
            Limit: 50
        });
    }

    async create(data: any) {
        const indexes = getIndexes(this.modelCls);
        const sortKey = getSortKey(this.modelCls);

        if (!data[String(sortKey)]) {
            throw new Error(`Sort key ${sortKey} already exists`);
        }
        const record = {
            id: uuidv4(),
            [String(sortKey)]: data[String(sortKey)],
            data: data
        };

        for (const index of indexes) {
            if (data[index]) {
                record[String(index)] = data[index];
            }
        }

        await this.connection.db.send(new PutCommand({
            TableName: this.getTableName(),
            Item: record
        }));
    }

}