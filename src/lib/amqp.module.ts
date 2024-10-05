import { DynamicModule, Logger, Module, Provider } from '@nestjs/common';
import * as amqplib from 'amqplib';
import { getConsumerToken, getSenderToken } from './decorators/sender-token.helper';
import { AmqpSender } from './amqp.sender';
import { AmqpConsumer } from './amqp.consumer';
import { IConnectionAsyncOptions, IConnectionOptions } from './interfaces/connection-options.interface';
import { AMQPTopics } from './common';

@Module({})
export class AmqpModule {
  private static readonly logger = new Logger(AmqpModule.name);
  private static connection: amqplib.Connection;
  private static reconnectInterval = 5000;

  private static async makeConnection(opts: IConnectionOptions) {
    if (!AmqpModule.connection) {
      await amqplib.connect(opts.url)
        .then(async (connection) => {
          connection.on('error', (err) => {
            AmqpModule.logger.error(err);
            throw err;
          });

          connection.on('close', () => {
            AmqpModule.logger.debug('Connection closed');
          });

          connection.on('connect', () => {
            AmqpModule.logger.debug('Connected to RabbitMQ');
          });

          AmqpModule.connection = connection;
        }).catch((err) => {
          AmqpModule.logger.error(err);
          throw err;
        });

      AmqpModule.logger.debug('Connected to RabbitMQ');

      return AmqpModule.connection;
    }

    return AmqpModule.connection;
  }
  private static async reconnect(opts: IConnectionOptions): Promise<void> {
    AmqpModule.logger.log(`Attempting to reconnect in ${AmqpModule.reconnectInterval / 1000} seconds...`);
    setTimeout(async () => {
      try {
        await AmqpModule.makeConnection(opts);
        AmqpModule.logger.log('Reconnected to RabbitMQ');
      } catch (err) {
        AmqpModule.logger.error('Reconnection attempt failed:', err);
        AmqpModule.reconnect(opts);
      }
    }, AmqpModule.reconnectInterval);
  }

  static forRootAsync(opts: IConnectionAsyncOptions): DynamicModule {
    return {
      module: AmqpModule,
      providers: [
        {
          provide: 'AMQP_CONNECTION',
          useFactory: async (...args) => {
            const config = opts.useFactory(...args);
            return await this.makeConnection({ url: config.url });
          },
          inject: opts.inject,
        },
      ],
      global: true,
      exports: ['AMQP_CONNECTION'],
    };
  }

  static forFeature(topic: AMQPTopics): DynamicModule {
    const pattern = `${String(topic).toLowerCase()}`;
    const providers: Provider[] = [
      {
        provide: 'AMQP_PATTERN',
        useValue: pattern
      },
      {
        provide: getSenderToken(pattern),
        useClass: AmqpSender,
      },
      {
        provide: getConsumerToken(pattern),
        useClass: AmqpConsumer,
      }
    ];

    return {
      module: AmqpModule,
      providers: providers,
      exports: providers,
    };
  }

}
