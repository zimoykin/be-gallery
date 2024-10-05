export const getSenderToken = (pattern: string) => `amqp:sender:${pattern}`;
export const getConsumerToken = (pattern: string) => `amqp:consumer:${pattern}`;