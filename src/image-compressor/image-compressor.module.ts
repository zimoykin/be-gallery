import { Module } from '@nestjs/common';
import { ImageCompressorService } from './image-compressor.service';

@Module({
  providers: [ImageCompressorService],
  exports: [ImageCompressorService],
})
export class ImageCompressorModule { }
