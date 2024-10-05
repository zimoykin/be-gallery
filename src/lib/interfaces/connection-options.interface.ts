import { InjectionToken } from "@nestjs/common";

export interface IConnectionOptions {
    url: string;
}

export interface IConnectionAsyncOptions {
    useFactory: (...args: any[]) => IConnectionOptions;
    inject: InjectionToken[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    imports: any[];
}

