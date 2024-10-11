import { Index, PrimaryKey, Required, SortKey, Table } from "src/libs/dynamo-db";

@Table(Profile.name)
export class Profile {
  @PrimaryKey()
  id: string;

  @SortKey('S')
  userId: string;

  name?: string;
  email?: string;

  location?: string;
  bio?: string;
  website?: string;

  url?: string;
  urlAvailableUntil?: number;

  @Index('N')
  @Required()
  privateAccess = 0; // 0: public, 1: private

  bucket?: { url: string; key: string; bucketName: string; folder: string };

}
