import { Index, PrimaryKey, Required, SortKey, Table } from "../../libs/dynamo-db";

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
