import { forwardRef, Module } from '@nestjs/common';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
import { DynamodbModule } from '../../libs/dynamo-db/dynamo-db.module';
import { PhotoModule } from '../photos/photo.module';
import { LikesConsumer } from './likes.consumer';
import { AmqpModule } from '../../libs/amqp/amqp.module';
import { PublicLikesController } from './public-likes.controller';
import { Like } from '../../libs/interfaces/models/like.model';

@Module({
  imports: [
    forwardRef(() => PhotoModule),
    AmqpModule.forFeature('like_added'),
    DynamodbModule.forFeature(Like)
  ],
  controllers: [LikesController, PublicLikesController],
  providers: [LikesService, LikesConsumer],
})
export class LikesModule { }
