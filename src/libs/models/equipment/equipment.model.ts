import { Index, PrimaryKey, Required, SortKey, Table } from "../../dynamo-db";

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
