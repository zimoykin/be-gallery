import { Module } from '@nestjs/common';
import { PhotoController } from './photo.controller';
import { PhotoService } from './photo.service';
import { DynamodbModule } from 'src/dynamo-db/dynamo-db.module';
import { Photo } from './photo.model';
import { S3BucketModule } from 'src/s3-bucket/s3-bucket.module';

@Module({
  imports: [
    DynamodbModule.forFeature(Photo),
    S3BucketModule.forFeature('photos')
  ],
  controllers: [PhotoController],
  providers: [PhotoService]
})
export class PhotoModule { }
