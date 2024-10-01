export enum SCAN_FILTER_OPERATIONS {
  CONTAINS = 'contains',
  MATCH = 'match',
  GTE = 'gte',
  LTE = 'lte',
  OR = 'or',
}

export interface IScanFilter<T = unknown, K extends keyof T = keyof T> {
  contains?: { [P in K]?: string; };
  match?: { [P in K]?: any; };
  gte?: { [P in K]?: number; };
  lte?: { [P in K]?: number; };
  or?: { [P in K]?: string[]; };
  limit?: number;
  skip?: number;
}
