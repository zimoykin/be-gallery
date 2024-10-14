import { OfferCategory } from "./offer-category.enum";

export interface IOfferInput {
  title: string;

  text?: string;

  price?: number;

  location?: string;
  
  category?: OfferCategory;

  profileId: string;
}
