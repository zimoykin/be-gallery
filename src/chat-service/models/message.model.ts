import { Index } from '../../libs/dynamo-db/decorators/index.decorator';
import { PrimaryKey } from '../../libs/dynamo-db/decorators/primary-key.decorator';
import { Required } from '../../libs/dynamo-db/decorators/required.decorator';
import { SortKey } from '../../libs/dynamo-db/decorators/sort-key.decorator';
import { Table } from '../../libs/dynamo-db/decorators/table.decorator';

@Table('messages')
export class Message {
  @PrimaryKey()
  id: string;

  @SortKey('S')
  senderId: string;

  @Required()
  @Index('S')
  receiverId: string;

  @Required()
  text: string;

  date: string;

  type: string;
}
