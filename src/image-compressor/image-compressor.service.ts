import { Injectable, Logger } from '@nestjs/common';
import * as sharp from 'sharp';

@Injectable()
export class ImageCompressorService {
  private readonly logger = new Logger(ImageCompressorService.name);
  async compressImage(
    file: Buffer,
    width: number,
    height?: number,
  ): Promise<Buffer> {
    try {
      const compressedImage = await sharp(file.buffer)
        .resize(width, height, { fit: 'cover' })
        .toBuffer();
      return compressedImage;
    } catch (error) {
      this.logger.error('Error compressing image:', error);
      throw error;
    }
  }

  async getImageSize(
    buffer: Buffer,
  ): Promise<{ width: number; height: number }> {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
    };
  }
}
