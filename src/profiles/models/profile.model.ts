import { PrimaryKey } from '../../dynamo-db/decorators/primary-key.decorator';
import { SortKey } from '../../dynamo-db/decorators/sort-key.decorator';
import { Table } from '../../dynamo-db/decorators/table.decorator';
import { Index } from '../../dynamo-db/decorators/index.decorator';
import { Required } from '../../dynamo-db/decorators/required.decorator';

@Table(Profile.name)
export class Profile {
  @PrimaryKey()
  id: string;

  @SortKey('S')
  userId: string;

  name?: string;
  email?: string;

  location?: string;
  bio?: string;
  website?: string;

  url?: string;
  urlAvailableUntil?: number;

  @Index('N')
  @Required()
  privateAccess = 0; // 0: public, 1: private

  bucket?: { url: string; key: string; bucketName: string; folder: string };

}
