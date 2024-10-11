import { Index } from '../../dynamo-db/decorators/index.decorator';
import { PrimaryKey } from '../../dynamo-db/decorators/primary-key.decorator';
import { Required } from '../../dynamo-db/decorators/required.decorator';
import { SortKey } from '../../dynamo-db/decorators/sort-key.decorator';
import { Table } from '../../dynamo-db/decorators/table.decorator';

@Table('likes')
export class Like {
  @PrimaryKey()
  id: string;

  @SortKey('S')
  contentId: string; //topicId, photoId, commentId or offerId

  @Index('S')
  @Required()
  profileId: string;

  createdAt: string = new Date().toISOString();
}
