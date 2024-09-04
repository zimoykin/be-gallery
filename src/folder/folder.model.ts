import { Index } from "src/dynamo-db/decorators/index.decorator";
import { SortKey } from "src/dynamo-db/decorators/secondary-key.decorator";


export class Folder {
    title: string;
    description: string;

    @Index()
    userId: string;

    @SortKey()
    sortOrder: number;

    color: string;
    bgColor: string;
}