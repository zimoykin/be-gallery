import { ServiceCategory } from "src/libs/models/offers/offer-category.enum";
import { Offer } from "../libs/models/offers/offer.model";
import { DateTime } from "luxon";

export const offers = (profileId1: string, profileId2: string): Omit<Offer, '_id'>[] => [
  {
    title: 'Would you like to see the best photo and gastro trip in Spain?',
    description:
      'Our tour: Hiking in the Pyrenees 10.9km, yachting, gastronomy, wine tasting, 3 beautiful beaches, 7 nights in a 5 star hotel, free breakfast, all flying tickets included',
    price: 300,
    previewUrl: 'https://picsum.photos/id/28/1200/800',
    categories: [ServiceCategory.PHOTO_TOUR],
    profileId: profileId1,
    privateAccess: false,
    availableUntil: DateTime.now().plus({ days: 7 }).toJSDate(),
    discount: 10
  },
  {
    title: 'Italian city tour with Guide',
    description:
      'Bust tour: we will visit the city of Rome, free breakfast, all flying tickets included',
    price: 200,
    categories: [ServiceCategory.PHOTO_TOUR],
    profileId: profileId1,
    privateAccess: false,
    availableUntil: DateTime.now().plus({ days: 7 }).toJSDate(),
    discount: 10
  },
  {
    title: 'Canon EOS 90D DSLR',
    description:
      'Canon EOS 90D DSLR, in perfect condition, like new. Will be shipped to you in 5 days.',
    price: 750,
    categories: [ServiceCategory.CAMERA_OPERATOR],
    profileId: profileId2,
    privateAccess: false,
    availableUntil: DateTime.now().plus({ days: 7 }).toJSDate(),
    discount: 10
  },
];
