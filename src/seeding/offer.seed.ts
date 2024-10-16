import { ServiceCategory } from "src/libs/models/offers/offer-category.enum";
import { Offer } from "../libs/models/offers/offer.model";

export const offers = (profileId1: string, profileId2: string): Offer[] => [
  {
    id: "025b0acf-8433-4491-b6ce-4bb962a47c4f",
    title: 'Would you like to see the best photo and gastro trip in Spain?',
    text:
      'Our tour: Hiking in the Pyrenees 10.9km, yachting, gastronomy, wine tasting, 3 beautiful beaches, 7 nights in a 5 star hotel, free breakfast, all flying tickets included',
    price: 300,
    image: 'https://picsum.photos/id/28/1200/800',
    categories: [ServiceCategory.PHOTO_TOUR],
    profileId: profileId1,
    privateAccess: 0,
    availableUntil: new Date().getTime() + 1000 * 60 * 60 * 24 * 90,
  },
  {
    "id": "855779df-4715-47fd-8c63-e5930ebd7d68",
    title: 'Italian city tour with Guide',
    text:
      'Bust tour: we will visit the city of Rome, free breakfast, all flying tickets included',
    price: 200,
    categories: [ServiceCategory.PHOTO_TOUR],
    profileId: profileId1,
    privateAccess: 0,
    availableUntil: new Date().getTime() + 1000 * 60 * 60 * 24 * 90,
  },
  {
    "id": "2dd8864a-80dc-48c1-a387-fa994513220e",
    title: 'Canon EOS 90D DSLR',

    text:
      'Canon EOS 90D DSLR, in perfect condition, like new. Will be shipped to you in 5 days.',
    price: 750,
    categories: [ServiceCategory.CAMERA_OPERATOR],
    profileId: profileId2,
    privateAccess: 0,
    availableUntil: new Date().getTime() + 1000 * 60 * 60 * 24 * 90,
  },
];
