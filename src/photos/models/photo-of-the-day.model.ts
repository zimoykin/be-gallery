import { Index } from 'src/dynamo-db/decorators/index.decorator';
import { PrimaryKey } from 'src/dynamo-db/decorators/primary-key.decorator';
import { Required } from 'src/dynamo-db/decorators/required.decorator';
import { SortKey } from 'src/dynamo-db/decorators/sort-key.decorator';
import { Table } from 'src/dynamo-db/decorators/table.decorator';

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
