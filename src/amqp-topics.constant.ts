import { plainToInstance } from "class-transformer";
import { IsISO8601, IsString, IsUUID, validate } from "class-validator";


type DtoConstructor<T extends PayloadDto> = new () => T;
export type AMQPTopics = keyof typeof AMQP_TOPICS;

interface IAmpqTopic {
    [key: string]: {
        topic: string;
        payload: DtoConstructor<PayloadDto>;
    };
}

class PayloadDto {
    @IsString()
    @IsISO8601()
    createdAt: string = new Date().toISOString();
}

class IFolderFavoriteChanged extends PayloadDto {
    @IsString()
    state: 'favorite_changed';

    @IsString()
    @IsUUID()
    contentId: string;
}

export const AMQP_TOPICS: IAmpqTopic = {
    folder_favorite_changed: {
        topic: 'folder:favorite-changed',
        payload: IFolderFavoriteChanged
    }
} as const;

export const validateIncommingMsg = async (msg: any) => {
    if (!msg)
        throw new Error('message is not provided');

    const cls = AMQP_TOPICS[msg.topic]?.payload;
    if (!cls)
        throw new Error(`unknown topic ${msg.topic}`);
    await validate(plainToInstance(cls, msg));
    return msg;
}

