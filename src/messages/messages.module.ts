import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { DynamodbModule } from 'src/dynamo-db/dynamo-db.module';
import { Message } from './models/message.model';

@Module({
  imports: [
    DynamodbModule.forFeature(Message)
  ],
  providers: [MessagesService],
  controllers: [MessagesController]
})
export class MessagesModule {}
