import { Offer } from './offer.model';

export const offers = (profileId: string): Omit<Offer, 'id'>[] => [
  {
    title: 'Would you like to see the best photo and gastro trip in Spain?',
    location: 'Sevilla, Malaga, Ronda and Marbello',
    description:
      'Our tour: Hiking in the Pyrenees 10.9km, yachting, gastronomy, wine tasting, 3 beautiful beaches, 7 nights in a 5 star hotel, free breakfast, all flying tickets included',
    price: 300,
    image: 'https://picsum.photos/id/28/1200/800',
    preview: 'https://picsum.photos/id/28/400/300',
    category: 'trip',
    profileId: profileId,
    url: 'https://www.google.com',
  },
  {
    title: 'Italian city tour with Guide',
    location: 'Rome, Naples, Milan and Venice',
    description:
      'Bust tour: we will visit the city of Rome, free breakfast, all flying tickets included',
    price: 200,
    image: 'https://picsum.photos/id/16/1200/800',
    preview: 'https://picsum.photos/id/16/400/300',
    category: 'trip',
    profileId: profileId,
    url: 'https://www.google.com',
  },
  {
    title: 'Canon EOS 90D DSLR',
    location: 'Regensburg, Germany',
    description:
      'Canon EOS 90D DSLR, in perfect condition, like new. Will be shipped to you in 5 days.',
    price: 750,
    image: 'https://picsum.photos/id/77/1200/800',
    preview: 'https://picsum.photos/id/77/400/300',
    category: 'camera',
    profileId: profileId,
    url: 'https://www.google.com',
  },
];
