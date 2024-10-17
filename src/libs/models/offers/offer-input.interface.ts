import { Location } from "./location.model";
import { ServiceCategory } from "./offer-category.enum";

export interface IOfferInput {
  title: string;
  description?: string;
  price?: number;
  location?: Location;
  category?: ServiceCategory[];
  profileId: string;
}
