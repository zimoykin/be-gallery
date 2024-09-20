import { IEquipment } from "./eqiupment.interface";

export interface IProfile {
    id: string;
    userId: string;
    name?: string;
    email?: string;
    location?: string;
    bio?: string;
    website?: string;
    privateAccess: boolean;
    bucket?: { url: string; key: string; bucketName: string; folder: string; };
    equipment?: IEquipment[];
    url?: string;
}