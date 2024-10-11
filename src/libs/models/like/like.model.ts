import { Index, PrimaryKey, Required, SortKey, Table } from "../../dynamo-db";

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
