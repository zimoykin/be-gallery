import { Index } from '../../dynamo-db/decorators/index.decorator';
import { PrimaryKey } from '../../dynamo-db/decorators/primary-key.decorator';
import { Required } from '../../dynamo-db/decorators/required.decorator';
import { SortKey } from '../../dynamo-db/decorators/sort-key.decorator';
import { Table } from '../../dynamo-db/decorators/table.decorator';

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
