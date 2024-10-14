import { Controller, Get, Logger } from '@nestjs/common';
import { UserAccess } from '@zimoykin/auth';
import { SettingsService } from './settings.service';

@UserAccess()
@Controller('api/v1/settings')
export class SettingsController {
    private readonly logger = new Logger(SettingsController.name);

    constructor(
        private readonly settingsService: SettingsService
    ) { }

    @Get('offer-categories')
    async getOfferCategories() {
        return this.settingsService.getOfferCategories();
    }
}
