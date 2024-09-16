import { Controller, Get, Logger } from "@nestjs/common";
import { PhotoOfTheDayService } from "./photo-of-the-day.service";
import { PublicPhotoOutputDto } from "./dtos/publick-photo-output-dto";
import { plainToInstance } from "class-transformer";

@Controller('api/v1/public/photos')
export class PhotoPublicController {
    private readonly logger = new Logger(PhotoPublicController.name);
    constructor(private readonly photoOfTheDayService: PhotoOfTheDayService) { }


    @Get('photo-of-the-day')
    async getPhotoOfTheDay(): Promise<PublicPhotoOutputDto> {
        return this.photoOfTheDayService.getPhotoOfTheDay()
            .then(photo => plainToInstance(PublicPhotoOutputDto, photo))
            .catch(err => {
                this.logger.error(err);
                throw err;
            });
    }

}