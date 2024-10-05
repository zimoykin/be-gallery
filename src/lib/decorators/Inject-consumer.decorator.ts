import { Inject } from "@nestjs/common";
import { getConsumerToken } from "./sender-token.helper";
import { AMQPTopics } from "../common/message";

export const InjectConsumer = (pattern: AMQPTopics) => {
    return Inject(getConsumerToken(String(pattern)));
};