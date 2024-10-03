import { Exclude, Expose, Type } from "class-transformer";
import { ValidateNested } from "class-validator";

@Exclude()
export class ProfileOutputDto {
    @Expose()
    id: string;

    @Expose()
    profileId: string;

    @Expose()
    email: string;

    @Expose()
    privateAccess: boolean;

    @Expose()
    userId: string;

    @Expose()
    location?: string;

    @Expose()
    bio?: string;

    @Expose()
    name?: string;

    @Expose()
    website?: string;

    @Expose()
    url: string;

}