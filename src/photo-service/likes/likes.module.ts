import { Module } from '@nestjs/common';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
import { LikesConsumer } from './likes.consumer';
import { AmqpModule } from '../../libs/amqp/amqp.module';
import { PublicLikesController } from './public-likes.controller';
import { PhotoDatabaseModule } from '../../libs/models/photo/photo.module';
import { LikeDatabaseModule } from '../../libs/models/like/like.module';

@Module({
  imports: [
    PhotoDatabaseModule,
    LikeDatabaseModule,
    AmqpModule.forFeature('like_added'),
  ],
  controllers: [LikesController, PublicLikesController],
  providers: [LikesService, LikesConsumer],
})
export class LikesModule { }
