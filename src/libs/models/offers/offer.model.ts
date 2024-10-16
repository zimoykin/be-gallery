import * as luxon from 'luxon';
import { Index, PrimaryKey, Required, SortKey, Table } from '../../../libs/dynamo-db';
import { ServiceCategory } from './offer-category.enum';

@Table('offers')
export class Offer {
  @PrimaryKey()
  id: string;

  @SortKey('S')
  profileId: string;

  title: string;
  text?: string; //Markdown

  price?: number;

  image?: string;

  preview?: {
    bucketName: string;
    folder: string;
    key: string;
    width?: number;
    height?: number;
    url: string;
  };

  previewUrl?: string;
  previewExpriredAt?: number;

  compressed?: {
    bucketName: string;
    folder: string;
    url: string;
    key: string;
    width?: number;
    height?: number;
  };

  compressedUrl?: string;
  compressedExpriredAt?: number;

  //services in the offer
  categories?: ServiceCategory[];

  @Index('N')
  privateAccess = 0; // 0: public, 1: private

  @Index('N')
  @Required()
  availableUntil: number;

  images?: string[];

  constructor() {
    const now = luxon.DateTime.now();
    now.plus({ month: 1 });
    this.availableUntil = now.toJSDate().getTime();
  }
}
