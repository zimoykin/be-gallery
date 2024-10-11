import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as amqplib from 'amqplib';
import { AMQP_TOPICS, AMQPTopics } from './common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PayloadDto } from './common/dtos/base-payload';

@Injectable()
export class AmqpSender implements OnModuleDestroy, OnModuleInit {
    private readonly logger = new Logger(AmqpSender.name);
    private channel: amqplib.Channel;

    constructor(
        // @ts-ignore
        @Inject('AMQP_CONNECTION') private readonly connection: amqplib.Connection,
        // @ts-ignore
        @Inject('AMQP_PATTERN') private readonly pattern: AMQPTopics
    ) { }

    async onModuleInit() {
        this.logger.debug(`AMQP-Sender to ${this.pattern}`);

        const setting = AMQP_TOPICS[this.pattern];
        if (!setting) {
            throw new Error(`Unknown topic: ${this.pattern}`);
        }

        const topic = `${setting.topic}.main`;
        const dlq_topic = `${setting.topic}.dlq`;

        this.logger.debug(`AMQP-Sender: ${this.pattern}`);
        const channel = await this.connection.createConfirmChannel();
        channel.prefetch(1);
        channel.assertQueue(topic, {
            durable: true,
        });
        this.channel = channel;
    }

    /**
     * Initialize the AMQP channel for this sender.
     * 
     * This method ensures that the channel is initialized and the queue is declared.
     * If the channel is already initialized, this method does nothing.
     * 
     * @returns A promise that resolves when the channel is initialized.
     */

    async onModuleDestroy() {
        this.logger.debug(`Destroy AMQP-Sender to ${this.pattern}`);
        this.channel?.close();
    }


    /**
     * Sends a message to the specified queue.
     * 
     * This method will first initialize the channel if it is not already initialized.
     * Then it will send the message to the queue and log any errors.
     * 
     * @param message - The message to send.
     */
    async sendMessage<T>(message: T) {
        const setting = AMQP_TOPICS[this.pattern];
        if (!setting) {
            throw new Error(`Unknown topic: ${this.pattern}`);
        }

        //define topic
        const topic = `${setting.topic}.main`;

        try {
            await validate(
                Object.assign(new setting.payload(), message)
            );

            this.channel?.sendToQueue(`${topic}`, Buffer.from(JSON.stringify(message)), {
                persistent: true
            });
        }
        catch (err) {
            this.logger.error(err);
        }
    }
}
