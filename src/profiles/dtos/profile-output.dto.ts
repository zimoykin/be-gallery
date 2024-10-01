import { Exclude, Expose, Type } from "class-transformer";
import { IEquipment } from "../interfaces/eqiupment.interface";
import { Equipment } from "./equipment.dto";
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
    @Type(() => Equipment)
    @ValidateNested({ each: true })
    equipment?: Equipment[];

    @Expose()
    url: string;

}