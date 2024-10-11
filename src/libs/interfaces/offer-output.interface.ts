export interface IOfferOutput {
  title: string;
  text?: string;
  price?: number;
  image?: string;
  preview: string;
  location?: string;
  category?: 'trip' | 'hotel' | 'restaurant' | 'camera' | 'lens' | 'other';
  url?: string;
}
