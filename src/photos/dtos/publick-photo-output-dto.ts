import { Exclude, Expose } from "class-transformer";

@Exclude()
export class PublicPhotoOutputDto {
    @Expose()
    id: string;

    @Expose()
    userId: string;

    @Expose()
    camera: string;

    @Expose()
    lens: string;

    @Expose()
    film: string;

    @Expose()
    likes: number;

    @Expose()
    url: string;
}