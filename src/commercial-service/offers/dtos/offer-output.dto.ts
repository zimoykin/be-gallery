import { IProfile } from "src/libs/models/profile/profile.interface";
import { ServiceCategory } from "../../../libs/models/offers/offer-category.enum";
import { Exclude, Expose, Transform, Type } from "class-transformer";
import { ProfileOutputDto } from "src/profile-service/profiles/dtos/profile-output.dto";
import { ValidateNested } from "class-validator";

@Exclude()
export class OfferOutputDto {
    @Expose({ name: 'id' })
    @Transform((value) => value.obj._id)
    id: string;

    @Expose()
    title: string;

    @Expose()
    text?: string;

    @Expose()
    price?: number;

    @Expose()
    discount?: number;

    @Expose()
    image?: string;

    @Expose()
    previewUrl: string;

    @Expose()
    compressedUrl: string;

    @Expose()
    categories?: keyof typeof ServiceCategory[];

    @Expose()
    location?: string;

    @Expose()
    profileId: string;

    @Expose()
    availableUntil: number;

    @Expose()
    @Type(() => ProfileOutputDto)
    @ValidateNested()
    profile: ProfileOutputDto;
}