import { Exclude, Expose, Type } from "class-transformer";
import { IEquipment } from "../interfaces/eqiupment.interface";
import { Equipments } from "./equipment.dto";

@Exclude()
export class ProfileOutputDto {
    @Expose()
    id: string;
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
    @Type(() => Equipments)
    equipment?: IEquipment;
}