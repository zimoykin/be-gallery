import { PrimaryKey } from "src/dynamo-db/decorators/primary-key.decorator";
import { SortKey } from "src/dynamo-db/decorators/sort-key.decorator";
import { Table } from "src/dynamo-db/decorators/table.decorator";
import { Equipment } from "./dtos/equipment.dto";
import { Index } from "src/dynamo-db/decorators/index.decorator";


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

    @Index('N')
    privateAccess: number = 1; // 0: public, 1: private

    bucket?: { url: string; key: string; bucketName: string; folder: string; };
    equipment?: Equipment[];
}