import { Index } from '../../dynamo-db/decorators/index.decorator';
import { PrimaryKey } from '../../dynamo-db/decorators/primary-key.decorator';
import { Required } from '../../dynamo-db/decorators/required.decorator';
import { SortKey } from '../../dynamo-db/decorators/sort-key.decorator';
import { Table } from '../../dynamo-db/decorators/table.decorator';

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
