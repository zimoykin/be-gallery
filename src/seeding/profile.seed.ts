import { ServiceCategory } from "src/libs/models/offers/offer-category.enum";
import { Profile } from "../libs/models/profile/models/profile.model";

export const profiles: Omit<Profile, '_id'>[] = [
  {
    name: 'John Doe',
    email: 'john.doe@me.com',
    location: {
      distance: 25,
      title: 'Regensburg, Germany',
      lat: 48.137,
      long: 12.101,
      point: {
        coordinates: [12.101, 48.137],
        type: 'Point',
      }
    },
    website: 'https://github.com/zimoykin',
    url: 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/24/24feebb92301fb4efeb3d0956024e33293b78c57_full.jpg',
    privateAccess: false,
    userId: '1',
    categories: [ServiceCategory.VIDEO_EDITING, ServiceCategory.DRONE_PHOTOGRAPHY, ServiceCategory.DRONE_VIDEOGRAPHY],
  },
  {
    name: 'Alessandra Bohne',
    email: 'jane.bohne@me.com',
    location: {
      distance: 25,
      title: 'Nuremberg, Germany',
      lat: 49.454,
      long: 11.076,
      point: {
        coordinates: [11.076, 49.454],
        type: 'Point',
      }
    },
    website: 'https://github.com/zimoykin',
    url: 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/1f/1f8ced3635f9a2a7d71bcb4a41fe006b9d9dc996_full.jpg',
    privateAccess: false,
    userId: '2',
    categories: [ServiceCategory.MAKEUP_ARTISTRY, ServiceCategory.SET_DESIGN],

  },
  {
    name: 'Freddy Kowalski',
    email: 'fred.kowalski@me.com',
    location: {
      distance: 50,
      title: 'Munich, Germany',
      lat: 48.137,
      long: 11.581,
      point: {
        coordinates: [11.581, 48.137],
        type: 'Point',
      }
    },
    website: 'https://github.com/zimoykin',
    url: 'https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShaggyMullet&accessoriesType=Wayfarers&hairColor=Black&facialHairType=MoustacheFancy&facialHairColor=Red&clotheType=CollarSweater&clotheColor=PastelYellow&eyeType=Cry&eyebrowType=Angry&mouthType=Serious&skinColor=Tanned',
    privateAccess: false,
    userId: '4',
    categories: [ServiceCategory.VIDEO_PRODUCTION, ServiceCategory.VIDEO_EDITING],
  },
  {
    name: 'Mary Smith',
    email: 'mary.smith@me.com',
    location: {
      distance: 50,
      title: 'Augsburg, Germany',
      lat: 48.366512,
      long: 10.894446,
      point: {
        coordinates: [10.894446, 48.366512],
        type: 'Point',
      },
    },
    categories: [ServiceCategory.VIDEO_EDITING, ServiceCategory.MAKEUP_ARTISTRY, ServiceCategory.SET_DESIGN],
    website: 'https://avatar.iran.liara.run/public/24',
    url: 'https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light',
    privateAccess: false,
    userId: '5',
  },
  {
    name: 'Dr. Dan Brown',
    email: 'dr.dan.brown@me.com',
    location: {
      distance: 50,
      title: 'Freising, Germany',
      lat: 48.37,
      long: 11.81,
      point: {
        type: 'Point',
        coordinates: [11.81, 48.37],
      }
    },
    website: 'https://avatar.iran.liara.run/public/24',
    url: 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/56/56a1ef1811d96a2537967f8ee21fece188ea2fbb_full.jpg',
    privateAccess: false,
    userId: '6',
    categories: [ServiceCategory.VIDEO_EDITING, ServiceCategory.VIDEO_PRODUCTION, ServiceCategory.CAMERA_OPERATOR],
  },
  {
    name: 'Renee Miller',
    email: 'renee.miller@me.com',
    url: 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/49/4976ef9575927a92d197a734fa93369877ac4421_full.jpg',
    location: {
      distance: 50,
      title: 'Ingolstadt, Germany',
      lat: 48.765,
      long: 11.371,
      point: {
        coordinates: [11.371, 48.765],
        type: 'Point',
      },
    },
    website: 'https://github.com/zimoykin',
    privateAccess: false,
    userId: '7',
    categories: [ServiceCategory.VIDEO_EDITING, ServiceCategory.VIDEO_PRODUCTION, ServiceCategory.LIGHTING, ServiceCategory.CAMERA_OPERATOR],
  }
];
