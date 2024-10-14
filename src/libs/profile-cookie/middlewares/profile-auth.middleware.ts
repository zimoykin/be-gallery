import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ProfileService } from '../../../profile-service/profiles/profile.service';

export const cookieProfileAuth = 'ProfileAuth';

@Injectable()
export class ProfileAuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ProfileAuthMiddleware.name);

  constructor(private readonly profileService: ProfileService) {}

  private getCookie(req: Request) {
    try {
      return req.signedCookies[cookieProfileAuth];
    } catch (error) {
      return undefined;
    }
  }

  private setCookie(res: Response, profileId: string) {
    try {
      res.cookie(cookieProfileAuth, profileId, {
        httpOnly: true,
        signed: true,
        sameSite: 'none',
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      });
    } catch (error) {
      this.logger.error('Error setting cookie:', error);
    }
  }

  use(req: Request, res: Response, next: NextFunction) {
    if (req.method === 'OPTIONS') {
      next();
      return;
    }

    if (!this.getCookie(req)) {
      this.logger.debug('No cookie found');
      if (req.headers.authorization) {
        const [, base64Url] = req.headers.authorization.split('.');
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const userData = JSON.parse(
          Buffer.from(base64, 'base64').toString('utf8'),
        );
        if (userData.id) {
          this.profileService
            .findProfileByUserId(userData.id)
            .catch((err) => {
              this.logger.error(err);
              next();
            })
            .then(async (profile) => {
              if (profile) {
                const profileCookie = JSON.stringify({
                  profileId: profile._id.toString(),
                  userId: userData.id,
                });
                this.setCookie(res, profileCookie);
                req['signedCookies'][cookieProfileAuth] = profileCookie;
                next();
              } else {
                next();
              }
            });
        } else {
          next();
        }
      } else next();
    } else {
      next();
    }
  }
}
