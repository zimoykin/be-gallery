import { Exclude, Expose } from "class-transformer";

@Exclude()
export class FolderOutputDto {
    @Expose()
    id: string;

    @Expose()
    title: string;

    @Expose()
    bgColor: string;

    @Expose()
    color: string;

    @Expose()
    description: string;

    @Expose()
    sortOrder: number;
}
