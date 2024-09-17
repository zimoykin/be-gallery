import { PrimaryKey } from "src/dynamo-db/decorators/primary-key.decorator";
import { SortKey } from "src/dynamo-db/decorators/sort-key.decorator";
import { Table } from "src/dynamo-db/decorators/table.decorator";
import { IEquipment } from "./interfaces/eqiupment.interface";


@Table(Profile.name)
export class Profile {
    @PrimaryKey()
    id: string;

    @SortKey('S')
    userId: string;

    name?: string;

    location?: string;
    bio?: string;
    website?: string;

    privateAccess: boolean = false;

    equipment?: IEquipment;
}