import { Module } from '@nestjs/common';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
import { DynamodbModule } from '../dynamo-db/dynamo-db.module';
import { Like } from './models/like.model';
import { PublicLikesController } from './public-likes.controller';
import { PhotoModule } from '../photos/photo.module';
import { LikesConsumer } from './likes.consumer';
import { AmqpModule } from '../lib/amqp.module';

@Module({
  imports: [PhotoModule,
    AmqpModule.forFeature('like_added'),
    DynamodbModule.forFeature(Like)],
  controllers: [LikesController, PublicLikesController],
  providers: [LikesService, LikesConsumer],
})
export class LikesModule { }
