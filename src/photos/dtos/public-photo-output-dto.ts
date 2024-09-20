import { Exclude, Expose, Type } from "class-transformer";
import { PhotoOutputDto } from "./photo-output.dto";
import { ValidateNested } from "class-validator";
import { ProfileOutputDto } from "src/profile/dtos/profile-output.dto";


@Exclude()
export class PublicPhotoOutputDto {
    @Expose()
    @ValidateNested()
    @Type(() => PhotoOutputDto)
    photo: PhotoOutputDto;

    @Expose()
    @ValidateNested()
    @Type(() => ProfileOutputDto)
    profile: ProfileOutputDto;
}
