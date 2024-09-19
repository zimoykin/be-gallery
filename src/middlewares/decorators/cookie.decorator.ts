
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { cookieProfileAuth } from '../profile-auth.middleware';
import { sign } from 'crypto';

export const Profile = createParamDecorator((_, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    console.log({ signedCookies: request.signedCookies });
    return request.signedCookies[cookieProfileAuth];
});
