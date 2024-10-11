import { Index, PrimaryKey, Required, SortKey, Table } from "../../../libs/dynamo-db";

@Table('folder')
export class Folder {
  @PrimaryKey()
  id: string;

  @SortKey('S')
  profileId: string;

  @Index('N')
  sortOrder: number;

  @Required()
  title: string;

  description: string;

  leftBottomColor: string;
  leftTopColor: string;
  centerTopColor: string;
  centerBottomColor: string;
  rightBottomColor: string;
  rightTopColor: string;

  url?: string;

  @Index('N')
  @Required()
  privateAccess = 0; // 0: public, 1: private

  favoriteFotoId?: string;
}
