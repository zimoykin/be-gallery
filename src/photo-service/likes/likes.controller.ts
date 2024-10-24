import { Controller, Delete, Get, Logger, Param, Post } from '@nestjs/common';
import { UserAccess } from '@zimoykin/auth';
import { LikesService } from './likes.service';
import { ProfileCookie, IProfileCookie } from '../../libs/profile-cookie';

@Controller('api/v1/likes')
@UserAccess()
export class LikesController {
  private readonly logger = new Logger(LikesController.name);

  constructor(private readonly service: LikesService) { }

  @Get('/:contentId')
  async getLikesByContentId(
    @ProfileCookie() profile: IProfileCookie,
    @Param('contentId') contentId: string) {
    return this.service
      .getLikesCountByContentIdAndProfileId(contentId, profile.profileId)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        this.logger.error(err);
        throw err;
      });
  }

  @Post('/:contentId')
  async updateLike(
    @Param('contentId') contentId: string,
    @ProfileCookie() profile: IProfileCookie,
  ) {
    return this.service
      .updateLike(contentId, profile.profileId)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        this.logger.error(err);
        throw err;
      });
  }

  @Delete('/:contentId')
  async deleteLike(
    @Param('contentId') contentId: string,
    @ProfileCookie() profile: IProfileCookie,
  ) {
    return this.service
      .deleteLike(contentId, profile.profileId)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        this.logger.error(err);
        throw err;
      });
  }
}
