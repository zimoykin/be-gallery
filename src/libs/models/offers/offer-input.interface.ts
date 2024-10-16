import { ServiceCategory } from "./offer-category.enum";

export interface IOfferInput {
  title: string;
  text?: string;
  price?: number;
  location?: string;
  category?: ServiceCategory[];
  profileId: string;
}
