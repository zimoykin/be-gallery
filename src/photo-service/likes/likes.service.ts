import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DynamoDbRepository } from '../../libs/dynamo-db/dynamo-db.repository';
import { Like } from './models/like.model';
import { InjectRepository } from '../../libs/dynamo-db/decorators/inject-model.decorator';
import { InjectSender } from '../../libs/amqp/decorators';
import { AmqpSender } from '../../libs/amqp/amqp.sender';

@Injectable()
export class LikesService {
  private readonly logger = new Logger(LikesService.name);

  constructor(
    //@ts-ignore
    @InjectRepository(Like.name)
    private readonly repo: DynamoDbRepository<Like>,
    //@ts-ignore
    @InjectSender('like_added') private readonly sender: AmqpSender,
  ) { }

  async getLikesCountByContentId(contentId: string) {
    const count = await this.repo.countByFilter({
      match: { contentId: contentId },
    });
    return count ?? 0;
  }

  async addLike(contentId: string, profileId: string) {
    const like = await this.repo.create({
      contentId: contentId,
      profileId: profileId,
    });

    await this.sender.sendMessage({
      state: 'added',
      contentId: contentId,
    });

    return like;
  }

  async deleteLike(contentId: string, profileId: string) {
    const like = await this.repo.findOneByFilter({
      match: { contentId: contentId, profileId: profileId },
    });
    if (!like) {
      throw new NotFoundException('Like not found');
    }
    await this.repo.remove(like.id);

    await this.sender.sendMessage({
      state: 'removed',
      contentId: contentId,
    });

    return like;
  }
}
