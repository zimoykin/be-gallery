import { Index } from '../../../libs/dynamo-db/decorators/index.decorator';
import { PrimaryKey } from '../../../libs/dynamo-db/decorators/primary-key.decorator';
import { Required } from '../../../libs/dynamo-db/decorators/required.decorator';
import { SortKey } from '../../../libs/dynamo-db/decorators/sort-key.decorator';
import { Table } from '../../../libs/dynamo-db/decorators/table.decorator';

@Table(PhotoOfTheDay.name)
export class PhotoOfTheDay {
  @PrimaryKey()
  id: string;

  @SortKey('S')
  photoId: string;

  @Required()
  @Index('N')
  photoDay: number;
}
