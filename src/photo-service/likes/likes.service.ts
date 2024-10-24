import { Injectable, Logger } from '@nestjs/common';
import { InjectSender } from '../../libs/amqp/decorators';
import { AmqpSender } from '../../libs/amqp/amqp.sender';
import { LikeRepository } from '../../libs/models/like/like.repository';

@Injectable()
export class LikesService {
  private readonly logger = new Logger(LikesService.name);

  constructor(
    private readonly likeRepository: LikeRepository,
    //@ts-ignore
    @InjectSender('like_updated') private readonly sender: AmqpSender,
  ) { }

  async getLikesCountByContentIdAndProfileId(contentId: string, profileId: string) {
    const count = await this.likeRepository.count({
      match: { contentId: contentId },
    });

    const yourLike = await this.likeRepository.find({
      match: {
        contentId: contentId,
        profileId: profileId
      }
    });
    return {
      count: count ?? 0,
      yourLike: yourLike.length > 0
    };

  }

  async updateLike(contentId: string, profileId: string) {

    const isLikeExist = await this.likeRepository.find({
      match: {
        profileId,
        contentId
      },
      limit: 1
    });

    if (isLikeExist.length > 0) {
      await this.likeRepository.remove(profileId, contentId);
    } else {
      await this.likeRepository.create({
        contentId: contentId,
        profileId: profileId,
      });
    }

    await this.sender.sendMessage({
      state: 'updated',
      contentId: contentId,
    });

    return true;
  }

  async deleteLike(contentId: string, profileId: string) {
    await this.likeRepository.remove(profileId, contentId);
    await this.sender.sendMessage({
      state: 'removed',
      contentId: contentId,
    });

    return true;
  }
}
