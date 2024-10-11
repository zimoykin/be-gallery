import * as luxon from 'luxon';
import { Index, PrimaryKey, Required, SortKey, Table } from '../../../libs/dynamo-db';

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
  preview: string;
  location?: string;
  category?: 'trip' | 'hotel' | 'restaurant' | 'camera' | 'lens' | 'other';
  url?: string;

  @Index('N')
  privateAccess = 0; // 0: public, 1: private

  @Index('N')
  @Required()
  availableUntil: number;

  constructor() {
    const now = luxon.DateTime.now();
    now.plus({ month: 1 });
    this.availableUntil = now.toJSDate().getTime();
  }
}
