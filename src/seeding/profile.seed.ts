import { Profile } from "../libs/models/profile/profile.model";

export const profiles: Omit<Profile, '_id'>[] = [
  {
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
    privateAccess: true,
    userId: '1',
  },
  {
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
    privateAccess: true,
    userId: '2',
  },
  {
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
    privateAccess: true,
    userId: '4',
  },
  {
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
    privateAccess: true,
    userId: '5',
  },
];
