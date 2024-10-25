import { Controller, Get, Logger, Query } from '@nestjs/common';
import { UserAccess } from '@zimoykin/auth';
import { SettingsService } from './settings.service';
import { LanguageDto } from './dtos/language.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@UserAccess()
@ApiBearerAuth('Authorization')
@Controller('api/v1/com/settings')
@ApiTags('Com')
export class SettingsController {
    private readonly logger = new Logger(SettingsController.name);

    constructor(
        private readonly settingsService: SettingsService
    ) { }

    @Get('categories')
    async getOfferCategories(
        @Query() query?: LanguageDto
    ) {
        return this.settingsService.getOfferCategories(query?.lang);
    }
}
