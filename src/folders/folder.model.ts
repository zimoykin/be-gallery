import { Required } from 'src/dynamo-db/decorators/required.decorator';
import { Index } from '../dynamo-db/decorators/index.decorator';
import { PrimaryKey } from '../dynamo-db/decorators/primary-key.decorator';
import { SortKey } from '../dynamo-db/decorators/sort-key.decorator';
import { Table } from '../dynamo-db/decorators/table.decorator';

@Table('folder')
export class Folder {
  @PrimaryKey()
  id: string;

  @SortKey('S')
  profileId: string;

  @Index('N')
  sortOrder: number;

  @Required()
  title: string;

  description: string;

  @Required()
  color: string;

  @Required()
  bgColor: string;

  @Required()
  privateAccess: boolean = false;

}
