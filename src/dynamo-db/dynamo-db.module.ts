import {
  DynamicModule,
  Logger,
  Module,
  Provider,
} from '@nestjs/common';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDbRepository } from './dynamo-db.repository';
import { getModelToken } from './decorators/model-token.helper';
import {
  IConnection,
  IConnectionAsyncOptions,
  IConnectionOptions,
} from './dynamo-db.interfaces';

@Module({})
export class DynamodbModule {
  private static readonly logger = new Logger(DynamodbModule.name);
  private static client: IConnection;
  /**
   * Creates a DynamoDB client if it doesn't exist, and returns it. If the
   * `prefixCollection` option is provided, it will be stored for use by the
   * `DynamoDBService`.
   * @param opts The options to create the client with
   * @returns The DynamoDB client
   */
  private static makeConnection(opts: IConnectionOptions): IConnection {
    DynamodbModule.logger.debug(`Region: ${opts.region}`);
    if (!this.client) {
      this.client = {
        db: new DynamoDB({
          region: opts.region,
          credentials: opts.credentials,
          logger: console,
          retryMode: 'standard',
          
        }),
        prefixCollection: opts.prefixCollection,
      };
    }
    return this.client;
  }

  /**
   * Registers the DynamoDB client with the root of the application.
   * The options passed in will be used to create the client.
   * @param opts - The options to create the client with.
   * @returns A dynamic module with the client registered.
   */
  static forRoot(opts: IConnectionOptions): DynamicModule {
    const providers: Provider[] = [
      {
        provide: 'DYNAMO-DB-CONNECTION',
        useFactory: async (): Promise<IConnection> => {
          return this.makeConnection(opts);
        },
      },
    ];

    return {
      module: DynamodbModule,
      providers: providers,
      exports: providers,
      global: true,
    };
  }

  /**
   * Registers the DynamoDB client asynchronously with the root of the application.
   * The options passed in will be used to create the client when the module is initialized.
   * @param opts - The options to create the client with.
   * @returns A dynamic module with the client registered.
   */
  static forRootAsync(opts: IConnectionAsyncOptions): DynamicModule {
    return {
      module: DynamodbModule,
      providers: [
        {
          provide: 'DYNAMO-DB-CONNECTION',
          useFactory: async (...args): Promise<IConnection> => {
            const config = opts.useFactory(...args);
            return this.makeConnection(config);
          },
          inject: opts.inject,
        },
      ],
      exports: ['DYNAMO-DB-CONNECTION'],
      global: true,
    };
  }

  static forFeature<T>(
    cls: new () => T,
    opts?: {
      connectionName?: string;
      seeding?: T[] | (() => T[]);
    },
  ): DynamicModule {
    const providers: Provider[] = [
      {
        provide: 'DYNAMO-DB-MODEL',
        useClass: cls,
      },
      {
        provide: getModelToken(cls.name.toLowerCase(), opts?.connectionName),
        useClass: DynamoDbRepository,
      },
    ];

    if (opts?.seeding) {
      providers.push({
        provide: `DYNAMO-DB-SEEDING`,
        useValue: Array.isArray(opts.seeding) ? opts.seeding : opts.seeding(),
      });
    }

    return {
      module: DynamodbModule,
      providers: providers,
      exports: providers,
    };
  }
}
