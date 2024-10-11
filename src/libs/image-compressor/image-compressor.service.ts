import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';
import axios from 'axios';

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
        .resize(width, height, { fit: 'cover', position: 'center' })
        .toBuffer();
      return compressedImage;
    } catch (error) {
      this.logger.error('Error compressing image:', error);
      throw error;
    }
  }

  async getImageBufferFromUrl(url: string) {
    const response = await axios({ url, responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data, 'binary');
    return imageBuffer;
  }

  async convertSvgToJpg(svgBuffer: unknown) {
    try {
      const jpgBuffer = await sharp(String(svgBuffer)).jpeg().toBuffer();

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


  //detrimine dominant color
  private async getDominantColor(buffer: Buffer) {
    const { data } = await sharp(buffer)
      .raw()
      .ensureAlpha()
      .toBuffer({ resolveWithObject: true });

    const colorCounts = {};

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const toHex = (component: number) => component.toString(16).padStart(2, '0');
      const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

      if (
        (r > 100 && g < 130 && b < 130) ||
        (r > 100 && g > 70 && g < 180 && b < 130) ||
        (r > 100 && g > 100 && b < 150) ||
        (r < 130 && g > 100 && b < 130) ||
        (r < 130 && g > 100 && b > 130) ||
        (r < 130 && g < 130 && b > 130) ||
        (r > 100 && g < 130 && b > 130)
      ) {
        colorCounts[hex] = (colorCounts[hex] || 0) + 1;
      }


    }

    let dominantColor = '#a6e3f1';
    let maxCount = 0;
    for (const color in colorCounts) {
      if (colorCounts[color] > maxCount) {
        maxCount = colorCounts[color];
        dominantColor = color;
      }
    }

    return dominantColor;
  }

  async determineDominantColors(url: string) {
    const imageBuffer = await this.getImageBufferFromUrl(url);
    const image = sharp(imageBuffer)
      .resize(100, 100)
      .blur(1)
      .toFormat('png', { bitdepth: 8 });

    const { width, height } = await image.metadata();
    if (width === undefined || height === undefined) {
      throw new Error('Could not determine image dimensions');
    }

    const leftTop = await image
      .extract({ left: 0, top: 0, width: 33, height: 50 })
      .toBuffer();

    const leftBottom = await image
      .extract({ left: 0, top: 50, width: 33, height: 50 })
      .toBuffer();

    const centerTop = await image
      .extract({ left: 33, top: 0, width: 33, height: 50 })
      .toBuffer();

    const centerBotom = await image
      .extract({ left: 33, top: 50, width: 33, height: 50 })
      .toBuffer();

    const rightTop = await image
      .extract({ left: 66, top: 0, width: 25, height: 50 })
      .toBuffer();

    const rightBottom = await image
      .extract({ left: 66, top: 50, width: 33, height: 50 })
      .toBuffer();

    const leftTopColor = await this.getDominantColor(leftTop);
    const leftBottomColor = await this.getDominantColor(leftBottom);
    const centerTopColor = await this.getDominantColor(centerTop);
    const centerBottomColor = await this.getDominantColor(centerBotom);
    const rightTopColor = await this.getDominantColor(rightTop);
    const rightBottomColor = await this.getDominantColor(rightBottom);

    return { leftTopColor, leftBottomColor, centerTopColor, centerBottomColor, rightTopColor, rightBottomColor };

  }
}
