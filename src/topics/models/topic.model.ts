import { PrimaryKey } from '../../dynamo-db/decorators/primary-key.decorator';
import { Required } from '../../dynamo-db/decorators/required.decorator';
import { SortKey } from '../../dynamo-db/decorators/sort-key.decorator';
import { Table } from '../../dynamo-db/decorators/table.decorator';

@Table('topic')
export class Topic {
  @PrimaryKey()
  id: string;

  @SortKey('S')
  profileId: string;

  @Required()
  title: string;

  bucket?: {
    bucketName: string;
    folder: string;
    url: string;
    key: string;
  };

  @Required()
  text: string;

  url?: string;
}
