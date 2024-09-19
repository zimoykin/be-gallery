
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { cookieProfileAuth } from '../profile-auth.middleware';

export const Profile = createParamDecorator((_, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.signedCookies[cookieProfileAuth];
});
