import { PrimaryKey } from "src/dynamo-db/decorators/primary-key.decorator";
import { SortKey } from "src/dynamo-db/decorators/sort-key.decorator";
import { Table } from "src/dynamo-db/decorators/table.decorator";
import { Equipment } from "./dtos/equipment.dto";


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

    privateAccess: boolean = false;
    bucket?: { url: string; key: string; bucketName: string; folder: string; };
    equipment?: Equipment[];
}