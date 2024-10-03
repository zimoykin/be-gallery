import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { DynamodbModule } from 'src/dynamo-db/dynamo-db.module';
import { Message } from './models/message.model';
import { messages } from './models/message.seed';
import { profiles } from 'src/profiles/models/profile.seed';

@Module({
  imports: [
    DynamodbModule.forFeature(Message, {


      seeding: () => {

        const msg: Omit<Message, 'id'>[] = [];
        messages.forEach(message => {
          profiles.forEach(profile1 => {
            profiles.forEach(profile2 => {
              msg.push({
                ...message,
                senderId: profile1.id,
                receiverId: profile2.id
              });
            });
          });
        });

        return msg;
      }
    })
  ],
  providers: [MessagesService],
  controllers: [MessagesController]
})
export class MessagesModule { }
