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
        .jpeg({ quality: 80 })
        .resize(width, height, { fit: 'cover' })
        .toBuffer();
      return compressedImage;
    } catch (error) {
      this.logger.error('Error compressing image:', error);
      throw error;
    }
  }

  async convertSvgToJpg(svgBuffer: any) {
    try {
      const jpgBuffer = await sharp(svgBuffer)
        .jpeg()
        .toBuffer();

      return jpgBuffer;
    } catch (error) {
      console.error('Error converting SVG to JPG:', error);
    }
  }

  async getImageSize(
    buffer: Buffer,
  ): Promise<{ width: number; height: number; }> {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width ?? 0,
      height: metadata.height ?? 0,
    };
  }
}
