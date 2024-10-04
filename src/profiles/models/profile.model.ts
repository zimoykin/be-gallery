import { PrimaryKey } from 'src/dynamo-db/decorators/primary-key.decorator';
import { SortKey } from 'src/dynamo-db/decorators/sort-key.decorator';
import { Table } from 'src/dynamo-db/decorators/table.decorator';
import { Index } from 'src/dynamo-db/decorators/index.decorator';
import { Required } from 'src/dynamo-db/decorators/required.decorator';

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

  @Index('N')
  @Required()
  privateAccess = 0; // 0: public, 1: private

  bucket?: { url: string; key: string; bucketName: string; folder: string };
  url?: string;
}
