import { Module } from '@nestjs/common';
import { TopicController } from './topic.controller';
import { TopicService } from './topic.service';
import { DynamodbModule } from 'src/dynamo-db/dynamo-db.module';
import { Topic } from './models/topic.model';

@Module({
  imports: [
    DynamodbModule.forFeature(Topic),
  ],
  controllers: [TopicController],
  providers: [TopicService]
})
export class TopicModule {}
