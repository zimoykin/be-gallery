import { Injectable, Logger } from '@nestjs/common';
import { OfferCategory } from 'src/libs/models/offers/offer-category.enum';

@Injectable()
export class SettingsService {
    private readonly logger = new Logger(SettingsService.name);

    async getOfferCategories() {
        return Object.values(OfferCategory);
    }
}
