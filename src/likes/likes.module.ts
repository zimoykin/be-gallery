import { Module } from '@nestjs/common';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
import { DynamodbModule } from 'src/dynamo-db/dynamo-db.module';
import { Like } from './models/like.model';

@Module({
  imports: [DynamodbModule.forFeature(Like)],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
