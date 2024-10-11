import { PrimaryKey } from '../../../libs/dynamo-db/decorators/primary-key.decorator';
import { Required } from '../../../libs/dynamo-db/decorators/required.decorator';
import { SortKey } from '../../../libs/dynamo-db/decorators/sort-key.decorator';
import { Table } from '../../../libs/dynamo-db/decorators/table.decorator';

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
