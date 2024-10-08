import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as amqplib from 'amqplib';
import { Observable, Subscriber } from 'rxjs';
import { AMQP_TOPICS, validateIncommingMsg } from './common';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AmqpConsumer implements OnModuleDestroy {
    private readonly logger = new Logger(AmqpConsumer.name);
    private channel: amqplib.Channel;
    private dlq_channel: amqplib.Channel;

    constructor(
        // @ts-ignore
        @Inject('AMQP_CONNECTION') private readonly connection: amqplib.Connection,
        // @ts-ignore
        @Inject('AMQP_PATTERN') private readonly pattern: string
    ) { }

    async onModuleDestroy() {
        if (this.channel) {
            await this.channel.close();
            this.logger.debug('AMQP channel closed');
        }
    }

    async subscribe<T>(cb: (message: T) => void): Promise<() => Promise<void>> {
        const setting = AMQP_TOPICS[this.pattern];
        if (!setting) {
            throw new Error(`Unknown topic: ${this.pattern}`);
        }
    
        const topic = `${setting.topic}.main`;
        const dlq_topic = `${setting.topic}.dlq`;
    
        try {
            this.logger.debug(`AMQP-Consumer: ${this.pattern}`);
    
            this.channel = await this.connection.createChannel();
            this.dlq_channel = await this.connection.createChannel();
    
            await this.channel.assertQueue(topic, { durable: true });
            await this.dlq_channel.assertQueue(dlq_topic, { durable: true });
    
            this.channel.prefetch(1);
    
            const consumeMessage = async (message) => {
                if (message !== null) {
                    try {
                        const setting = AMQP_TOPICS[this.pattern];
                        if (!setting) {
                            throw new Error(`Unknown topic: ${this.pattern}`);
                        }
    
                        const parsedMessage = JSON.parse(message.content.toString()) as T;
                        const result = await validateIncommingMsg(plainToInstance(setting.payload, parsedMessage));
                        await cb(result);
                        this.channel.ack(message);
                    } catch (error) {

                        await this.dlq_channel.sendToQueue(dlq_topic, Buffer.from(JSON.stringify(error)));
                        this.channel.ack(message);
                        this.logger.error(`Error while processing message: ${error.message}`);
                    }
                }
            };
    
            await this.channel.consume(topic, consumeMessage);
    
            return async () => {
                await this.channel.close();
                this.logger.debug(`Stopped consuming from pattern: ${this.pattern}`);
            };
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to subscribe to AMQP queue: ${error.message}`);
            }
            throw error;
        }
    }
    
}
