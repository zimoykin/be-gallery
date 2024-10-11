import { IsString } from "class-validator";

export class LikeAddedDto {

    @IsString()
    state: 'added';

    @IsString()
    contentId: string;
}