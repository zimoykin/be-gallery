import { PrimaryKey } from 'src/dynamo-db/decorators/primary-key.decorator';
import { SortKey } from 'src/dynamo-db/decorators/sort-key.decorator';
import { Table } from 'src/dynamo-db/decorators/table.decorator';

@Table('offers')
export class Offer {
  @PrimaryKey()
  id: string;

  @SortKey('S')
  profileId: string;

  title: string;
  description?: string;
  price?: number;
  image?: string;
  preview: string;
  location?: string;
  category?: 'trip' | 'hotel' | 'restaurant' | 'camera' | 'lens' | 'other';
  url?: string;
}
