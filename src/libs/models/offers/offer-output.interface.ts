import { ServiceCategory } from "./offer-category.enum";

export interface IOfferOutput {
  title: string;
  text?: string;
  price?: number;
  discount?: number;
  previewUrl: string;
  compressedUrl: string;
  category?: keyof typeof ServiceCategory;
  url?: string;
}
