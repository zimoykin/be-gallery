import { ServiceCategory } from "./offer-category.enum";

export interface IOfferOutput {
  title: string;
  text?: string;
  price?: number;
  previewUrl: string;
  compressedUrl: string;
  category?: ServiceCategory;
  url?: string;
}
