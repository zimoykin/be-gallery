import { Table } from "src/dynamo-db/decorators/table.decorator";
import { Index } from "../dynamo-db/decorators/index.decorator";
import { PrimaryKey } from "../dynamo-db/decorators/primary-key.decorator";
import { SortKey } from "../dynamo-db/decorators/sort-key.decorator";
import { Required } from "../dynamo-db/decorators/required.decorator";

@Table(Photo.name)
export class Photo {
    @PrimaryKey()
    id: string;

    @SortKey()
    sortOrder: number;

    @Index()
    @Required()
    userId: string;

    @Index()
    @Required()
    folderId: string;

    @Required()
    camera: string;
    lens?: string;
    iso?: string;
    film?: string;
    location?: string;
    description?: string;

    @Required()
    url: {
        bucketName: string;
        folder: string;
        url: string,
        key: string;
    };
}
