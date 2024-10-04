import { Module } from '@nestjs/common';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
import { DynamodbModule } from '../dynamo-db/dynamo-db.module';
import { Like } from './models/like.model';
import { PublicLikesController } from './public-likes.controller';

@Module({
  imports: [DynamodbModule.forFeature(Like)],
  controllers: [LikesController, PublicLikesController],
  providers: [LikesService],
})
export class LikesModule {}
