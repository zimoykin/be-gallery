import { Injectable, Logger } from '@nestjs/common';
import { DynamoDbRepository } from '../../libs/dynamo-db/dynamo-db.repository';
import { InjectRepository } from '../../libs/dynamo-db/decorators/inject-model.decorator';
import { Topic } from './models/topic.model';

@Injectable()
export class TopicService {
  private readonly logger = new Logger(TopicService.name);
  constructor(
    // @ts-ignore //
    @InjectRepository(Topic)
    private readonly topicRepository: DynamoDbRepository<Topic>,
  ) {}
}
