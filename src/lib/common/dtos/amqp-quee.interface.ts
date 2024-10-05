import { PayloadDto } from "./base-payload";

type DtoConstructor<T extends PayloadDto> = new () => T;
export interface IAmpqTopic {
    [key: string]: {
        topic: string;
        payload: DtoConstructor<PayloadDto>;
    };
}
