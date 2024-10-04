import { Index } from 'src/dynamo-db/decorators/index.decorator';
import { PrimaryKey } from 'src/dynamo-db/decorators/primary-key.decorator';
import { Required } from 'src/dynamo-db/decorators/required.decorator';
import { SortKey } from 'src/dynamo-db/decorators/sort-key.decorator';
import { Table } from 'src/dynamo-db/decorators/table.decorator';

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
