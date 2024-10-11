import { Index } from '../../../libs/dynamo-db/decorators/index.decorator';
import { PrimaryKey } from '../../../libs/dynamo-db/decorators/primary-key.decorator';
import { Required } from '../../../libs/dynamo-db/decorators/required.decorator';
import { SortKey } from '../../../libs/dynamo-db/decorators/sort-key.decorator';
import { Table } from '../../../libs/dynamo-db/decorators/table.decorator';

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
