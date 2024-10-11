import { Controller, Get, Logger, Param } from '@nestjs/common';
import { LikesService } from './likes.service';
import { UserAccess } from '@zimoykin/auth';

@Controller('api/v1/public/likes')
@UserAccess()
export class PublicLikesController {
  private readonly logger = new Logger(PublicLikesController.name);

  constructor(private readonly service: LikesService) {}

  @Get('/:contentId')
  async getLikesByContentId(@Param('contentId') contentId: string) {
    return this.service
      .getLikesCountByContentId(contentId)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        this.logger.error(err);
        throw err;
      });
  }
}
