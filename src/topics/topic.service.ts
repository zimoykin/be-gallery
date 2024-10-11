import { Injectable, Logger } from '@nestjs/common';
import { Topic } from './models/topic.model';
import { DynamoDbRepository } from '../dynamo-db/dynamo-db.repository';
import { InjectRepository } from '../dynamo-db/decorators/inject-model.decorator';

@Injectable()
export class TopicService {
  private readonly logger = new Logger(TopicService.name);
  constructor(
    // @ts-ignore //
    @InjectRepository(Topic.name)
    private readonly topicRepository: DynamoDbRepository<Topic>,
  ) {}
}
