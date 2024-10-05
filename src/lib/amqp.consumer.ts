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

    /**
     * Subscribe to an AMQP queue and listen for messages.
     *
     * @param cb - The callback to call when a message is received. The callback receives the parsed message object as an argument.
     * @returns A promise that resolves to a function which unsubscribes from the queue and closes the channel when called.
     * @throws {Error} - If there is an error subscribing to the queue, the promise is rejected with the error.
     */
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

            const observable = new Observable((subscriber: Subscriber<T>) => {
                this.channel.consume(topic, async (message) => {
                    if (message !== null) {

                        const setting = AMQP_TOPICS[this.pattern];
                        if (!setting) {
                            throw new Error(`Unknown topic: ${this.pattern}`);
                        }

                        const parsedMessage = JSON.parse(message.content.toString()) as T;
                        const result = await validateIncommingMsg(plainToInstance(setting.payload, parsedMessage));

                        subscriber.next(result);
                        this.channel.ack(message);
                    }
                });
            });

            const subscription = observable.subscribe(cb);

            return async () => {
                subscription.unsubscribe();
                await this.channel.close();
                this.logger.debug(`Stopped consuming from pattern: ${this.pattern}`);
            };
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to subscribe to AMQP queue: ${error.message}`);
            }
            await this.dlq_channel.sendToQueue(dlq_topic, Buffer.from(JSON.stringify(error)));
            throw error;
        }
    }
}
