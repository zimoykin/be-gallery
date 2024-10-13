import { Profile } from "../libs/models/profile/profile.model";

export const profiles: Profile[] = [
  {
    id: '530f8f06-0bc2-43a5-814d-fa7b2e5587b9',
    name: 'John Doe',
    email: 'john.doe@me.com',
    location: {
      distance: 25,
      title: 'Regensburg, Germany',
      lat: 48.137,
      long: 12.101,
    },
    website: 'https://github.com/zimoykin',
    url: 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/24/24feebb92301fb4efeb3d0956024e33293b78c57_full.jpg',
    privateAccess: 0,
    userId: '1',
  },
  {
    id: 'ffd46c13-52c3-4c2c-92a4-85214b8723cd',
    name: 'Alessandra Bohne',
    email: 'jane.bohne@me.com',
    location: {
      distance: 25,
      title: 'Nuremberg, Germany',
      lat: 49.454,
      long: 11.076,
    },
    website: 'https://github.com/zimoykin',
    url: 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/1f/1f8ced3635f9a2a7d71bcb4a41fe006b9d9dc996_full.jpg',
    privateAccess: 0,
    userId: '2',
  },
  {
    id: '86fcb1db-96d9-4ff5-8424-7e1d8e76d7c9',
    name: 'Freddy Kowalski',
    email: 'fred.kowalski@me.com',
    location: {
      distance: 50,
      title: 'Munich, Germany',
      lat: 48.137,
      long: 11.581,
    },
    website: 'https://github.com/zimoykin',
    url: 'https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShaggyMullet&accessoriesType=Wayfarers&hairColor=Black&facialHairType=MoustacheFancy&facialHairColor=Red&clotheType=CollarSweater&clotheColor=PastelYellow&eyeType=Cry&eyebrowType=Angry&mouthType=Serious&skinColor=Tanned',
    privateAccess: 0,
    userId: '4',
  },
  {
    id: 'aafc6ff9-8898-4fcb-977e-385eed3e178c',
    name: 'Mary Smith',
    email: 'mary.smith@me.com',
    location: {
      distance: 50,
      title: 'Augsburg, Germany',
      lat: 48.366512,
      long: 10.894446,
    },
    website: 'https://avatar.iran.liara.run/public/24',
    url: 'https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light',
    privateAccess: 0,
    userId: '5',
  },
];
