import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DynamoDbRepository } from 'src/dynamo-db/dynamo-db.repository';
import { Like } from './models/like.model';
import { InjectRepository } from '../dynamo-db/decorators/inject-model.decorator';

@Injectable()
export class LikesService {
  private readonly logger = new Logger(LikesService.name);

  constructor(
    //@ts-ignore
    @InjectRepository(Like.name)
    private readonly repo: DynamoDbRepository<Like>,
  ) {}

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
    return like;
  }
}
