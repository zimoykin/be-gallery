import { Select } from "@aws-sdk/client-dynamodb";

export enum SCAN_FILTER_OPERATIONS {
  CONTAINS = 'contains',
  MATCH = 'match',
  GTE = 'gte',
  LTE = 'lte',
}

export interface IScanFilter<T = unknown, K extends keyof T = keyof T> {
  contains?: { [key: string]: string; };
  match?: { [key: string]: any; };
  gte?: { [P in K]?: number; };
  lte?: { [P in K]?: number; };
  limit?: number;
  skip?: number;
}
