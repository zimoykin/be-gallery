import { Index } from "src/dynamo-db/decorators/index.decorator";
import { PrimaryKey } from "src/dynamo-db/decorators/primary-key.decorator";
import { Required } from "src/dynamo-db/decorators/required.decorator";
import { SortKey } from "src/dynamo-db/decorators/sort-key.decorator";
import { Table } from "src/dynamo-db/decorators/table.decorator";

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
    favorite: number = 0; // 1 - true, 0 - false 
}