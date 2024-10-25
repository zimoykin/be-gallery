import { Injectable, Logger } from '@nestjs/common';
import { Language, ServiceCategory } from 'src/libs/models/offers/offer-category.enum';

@Injectable()
export class SettingsService {
    private readonly logger = new Logger(SettingsService.name);

    async getOfferCategories(lang: Language = Language.EN) {
        return Object.entries(ServiceCategory).map(([, value]) => {
            return value[lang];
        });
    }
}
