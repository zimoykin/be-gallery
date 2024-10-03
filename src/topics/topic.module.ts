import { Module } from '@nestjs/common';
import { TopicController } from './topic.controller';
import { TopicService } from './topic.service';
import { DynamodbModule } from 'src/dynamo-db/dynamo-db.module';
import { Topic } from './models/topic.model';
import { profiles } from 'src/profiles/models/profile.seed';
import { topics } from './models/topic.seed';

@Module({
  imports: [
    DynamodbModule.forFeature(Topic, {
      seeding: () => {
        return topics.map(profile => {
          return {
            ...profile,
            profileId: profiles.sort(() => Math.random() - 0.5)[0].id
          };
        });
      }
    }),
  ],
  controllers: [TopicController],
  providers: [TopicService]
})
export class TopicModule { }
