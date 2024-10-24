import { IsString } from "class-validator";

export class LikeUpdatedDto {

    @IsString()
    state: 'updated';

    @IsString()
    contentId: string;
}