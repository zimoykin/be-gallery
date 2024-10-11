import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { InjectionToken } from '@nestjs/common';

export interface IConnectionOptions {
  region: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  // databaseName: string;
  prefixCollection?: string;
}

export interface IConnectionAsyncOptions {
  inject?: InjectionToken[];
  // eslint-disable-next-line
  useFactory: (...args: any[]) => IConnectionOptions;
  // eslint-disable-next-line
  imports: any[];
}

export interface IConnection {
  db: DynamoDB;
  prefixCollection?: string;
}
