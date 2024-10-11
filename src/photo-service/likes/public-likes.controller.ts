import { Controller, Logger } from '@nestjs/common';
import { UserAccess } from '@zimoykin/auth';

@Controller('api/v1/public/likes')
@UserAccess()
export class PublicLikesController {
  private readonly logger = new Logger(PublicLikesController.name);
}
