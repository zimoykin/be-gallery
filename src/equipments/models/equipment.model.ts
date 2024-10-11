import { Index } from '../../dynamo-db/decorators/index.decorator';
import { PrimaryKey } from '../../dynamo-db/decorators/primary-key.decorator';
import { Required } from './../../dynamo-db/decorators/required.decorator';
import { SortKey } from '../../dynamo-db/decorators/sort-key.decorator';
import { Table } from '../../dynamo-db/decorators/table.decorator';

@Table(Equipment.name)
export class Equipment {
  @PrimaryKey()
  id: string;

  @SortKey('S')
  profileId: string;

  @Required()
  name: string;

  @Required()
  @Index('S')
  category: string;

  @Required()
  @Index('N')
  favorite = 0; // 1 - true, 0 - false
}
