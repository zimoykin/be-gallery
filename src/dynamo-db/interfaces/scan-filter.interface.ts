
export enum SCAN_FILTER_OPERATIONS {
    CONTAINS = 'contains',
    MATCH = 'match',
    GTE = 'gte',
    LTE = 'lte',
}

export interface IScanFilter {
    'contains'?: { [key: string]: string; };
    'match'?: { [key: string]: any; };
    'gte'?: { [key: string]: number; };
    'lte'?: { [key: string]: number; };
    limit?: number,
    skip?: number;
}