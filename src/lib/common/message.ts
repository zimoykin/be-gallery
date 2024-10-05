import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { FolderDominantColor, FolderFavoriteChanged } from "./dtos/folder-favorite";
import { UserCreatedDto } from "./dtos/user-created.dto";
import { LikeAddedDto } from "./dtos/like-added.dto";


export type AMQPTopics = keyof typeof AMQP_TOPICS;

export const AMQP_TOPICS = {
    folder_favorite_changed: {
        topic: 'folder:favorite-changed',
        payload: FolderFavoriteChanged
    },
    folder_dominant_color: {
        topic: 'folder:dominant-color',
        payload: FolderDominantColor
    },
    user_created: {
        topic: 'user:created',
        payload: UserCreatedDto
    },
    like_added: {
        topic: 'like:added',
        payload: LikeAddedDto
    },

} as const;

export const validateIncommingMsg = async (msg: any) => {
    if (!msg)
        throw new Error('message is not provided');


    await validate(msg);
    return msg;
}

