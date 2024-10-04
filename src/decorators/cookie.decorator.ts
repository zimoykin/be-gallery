import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { cookieProfileAuth } from '../middlewares/profile-auth.middleware';
import { IProfileCookie } from '../middlewares/profile-cookie.interface';

export const Profile = createParamDecorator(
  (_, ctx: ExecutionContext): IProfileCookie | undefined => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.signedCookies[cookieProfileAuth]) {
      return undefined;
    }
    try {
      const profile = JSON.parse(request.signedCookies[cookieProfileAuth]);
      if (profile.userId !== request.auth.id) {
        //TODO: throw error
        return undefined;
      } else {
        return profile;
      }
    } catch (error) {
      return undefined;
    }
  },
);
