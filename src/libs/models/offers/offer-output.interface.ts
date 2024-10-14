import { OfferCategory } from "./offer-category.enum";

export interface IOfferOutput {
  title: string;
  text?: string;
  price?: number;
  previewUrl: string;
  compressedUrl: string;
  category?: OfferCategory;
  url?: string;
}
