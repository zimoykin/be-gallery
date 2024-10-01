import { Offer } from "src/offers/models/offer.model";
import { IFolder } from "../folders/interfaces/folder.interface";
import { IProfile } from "../profiles/interfaces/profile.interface";

export const profiles: Omit<IProfile, 'id'>[] = [
    {
        name: "John Doe",
        email: "john.doe@me.com",
        location: "Regensburg, Germany",
        website: "https://github.com/zimoykin",
        url: "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/24/24feebb92301fb4efeb3d0956024e33293b78c57_full.jpg",
        privateAccess: 0,
        userId: "1",
        equipment: [
            {
                favorite: false,
                name: "kodak 35",
                type: "camera",
            }, {
                favorite: true,
                name: "Canon 70D",
                type: "camera",
            }, {
                favorite: true,
                name: "Canon 35-80mm F/4-5.6 IS II USM",
                type: "lens",
            }
        ],
    },
    {

        name: "Alessandra Bohne",
        email: "jane.bohne@me.com",
        location: "Milan, Italy",
        website: "https://github.com/zimoykin",
        url: "https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraightStrand&accessoriesType=Blank&hairColor=Black&facialHairType=Blank&clotheType=Hoodie&clotheColor=Blue02&eyeType=Happy&eyebrowType=AngryNatural&mouthType=Default&skinColor=Brown",
        privateAccess: 0,
        userId: "2",
        equipment: [],
    },
    {

        name: "Alberta De Nou",
        email: "albert.nou@me.com",
        location: "Paris, France",
        website: "https://github.com/zimoykin",
        url: "https://avataaars.io/?avatarStyle=Circle&topType=LongHairCurvy&accessoriesType=Sunglasses&hairColor=BrownDark&facialHairType=Blank&facialHairColor=Brown&clotheType=ShirtScoopNeck&clotheColor=Blue02&eyeType=Default&eyebrowType=Angry&mouthType=Sad&skinColor=Yellow",
        privateAccess: 0,
        userId: "3",
        equipment: [],
    },
    {

        name: "Freddy Kowalski",
        email: "fred.kowalski@me.com",
        location: "London, UK",
        website: "https://github.com/zimoykin",
        url: "https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShaggyMullet&accessoriesType=Wayfarers&hairColor=Black&facialHairType=MoustacheFancy&facialHairColor=Red&clotheType=CollarSweater&clotheColor=PastelYellow&eyeType=Cry&eyebrowType=Angry&mouthType=Serious&skinColor=Tanned",
        privateAccess: 0,
        userId: "4",
        equipment: [],
    },
    {

        name: "Mary Smith",
        email: "mary.smith@me.com",
        location: "New York, USA",
        website: "https://avatar.iran.liara.run/public/24",
        url: "https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light",
        privateAccess: 0,
        userId: "5",
        equipment: [],
    },
    {

        name: "Marty Brodkowski",
        email: "marty.smith@me.com",
        location: "Texas Area, USA",
        website: "https://github.com/zimoykin",
        url: "https://avataaars.io/?avatarStyle=Circle&topType=ShortHairSides&accessoriesType=Blank&hairColor=SilverGray&facialHairType=Blank&facialHairColor=Blonde&clotheType=Hoodie&clotheColor=Heather&graphicType=Hola&eyeType=Squint&eyebrowType=UnibrowNatural&mouthType=Default&skinColor=Light",
        privateAccess: 0,
        userId: "6",
        equipment: [],
    },
];

export const offers = (profileId: string): Omit<Offer, 'id'>[] => [
    {
        title: "Would you like to see the best photo and gastro trip in Spain?",
        location: "Sevilla, Malaga, Ronda and Marbello",
        description:
            "Our tour: Hiking in the Pyrenees 10.9km, yachting, gastronomy, wine tasting, 3 beautiful beaches, 7 nights in a 5 star hotel, free breakfast, all flying tickets included",
        price: 300,
        image: "https://picsum.photos/id/28/1200/800",
        preview: "https://picsum.photos/id/28/400/300",
        category: "trip",
        profileId: profileId,
        url: "https://www.google.com",
    },
    {

        title: "Italian city tour with Guide",
        location: "Rome, Naples, Milan and Venice",
        description:
            "Bust tour: we will visit the city of Rome, free breakfast, all flying tickets included",
        price: 200,
        image: "https://picsum.photos/id/16/1200/800",
        preview: "https://picsum.photos/id/16/400/300",
        category: "trip",
        profileId: profileId,
        url: "https://www.google.com",
    },
    {

        title: "Canon EOS 90D DSLR",
        location: "Regensburg, Germany",
        description:
            "Canon EOS 90D DSLR, in perfect condition, like new. Will be shipped to you in 5 days.",
        price: 750,
        image: "https://picsum.photos/id/77/1200/800",
        preview: "https://picsum.photos/id/77/400/300",
        category: "camera",
        profileId: profileId,
        url: "https://www.google.com",
    },
];

export const topics = (profileId: string) => [
    {

        title: "How to choose your first camera wisely?",
        url: "bg/topic-1.jpeg",
        profileId: profileId,
        text: `
          Choosing the right camera lens depends on what you’re trying to capture and the effect you want to achieve. Here's a guide on different types of lenses and their uses:
  
  1. Standard Lenses (35mm to 70mm)
  Best for: General photography, street photography, portraits.
  Characteristics: These lenses mimic the perspective of the human eye, producing images that look natural. The most common standard lens is the 50mm (often called the "nifty fifty"), which is versatile for a variety of situations, from landscapes to portraits.
  
  2. Wide-Angle Lenses (10mm to 35mm)
  Best for: Landscape photography, architecture, interiors.
  Characteristics: They offer a broader field of view, allowing you to capture more in a single frame. These lenses can create distortion at the edges of the frame, which can be artistic but might not be ideal for portraits.
  
  3. Telephoto Lenses (70mm to 300mm and beyond)
  Best for: Wildlife, sports, portraits, event photography.
  Characteristics: Telephoto lenses magnify distant subjects, making them appear closer. They also compress the background, which can make for flattering portraits by blurring the background.
  
  
  4. Macro Lenses (typically 50mm to 200mm)
  Best for: Close-up photography (flowers, insects, small objects).
  Characteristics: Macro lenses allow you to focus extremely close to your subject, capturing intricate details. They have a 1:1 reproduction ratio, meaning the subject appears life-size on the sensor.
  5. Fisheye Lenses (usually 8mm to 16mm)
  Best for: Creative photography, action shots, extreme wide-angle.
  Characteristics: Fisheye lenses create a circular or very distorted view, offering an ultra-wide-angle effect. They are fun for unique, dramatic shots but not typically used for everyday photography.
  6. Zoom Lenses (variable focal length, e.g., 24-70mm, 70-200mm)
  Best for: Versatile, all-purpose use.
  Characteristics: Zoom lenses cover a range of focal lengths, offering flexibility in one lens. They are great for travel or situations where you can’t change lenses frequently. The trade-off is that they tend to be heavier and may not offer the same image quality as prime lenses at specific focal lengths.
  7. Prime Lenses (fixed focal length, e.g., 35mm, 50mm, 85mm)
  Best for: Low-light photography, portraits, and sharpness.
  Characteristics: Since they have a fixed focal length, prime lenses usually offer better image quality and sharpness compared to zoom lenses. They also tend to have wider apertures (e.g., f/1.4, f/1.8), making them ideal for low-light conditions and achieving a shallow depth of field (blurred background).
  8. Portrait Lenses (85mm to 135mm)
  Best for: Portrait photography.
  Characteristics: These lenses offer a flattering perspective for portraits, providing enough distance between you and your subject while compressing the background to create a creamy bokeh effect.
  Considerations When Choosing a Lens:
  Focal length: Determines how much of the scene the lens can capture. Shorter focal lengths capture more of the scene (wide-angle), while longer focal lengths zoom in closer to your subject (telephoto).
  Aperture (f-stop): A wider aperture (low f-stop like f/1.4) allows more light in, great for low-light settings and achieving a shallow depth of field. Smaller apertures (higher f-stop like f/8) are good for keeping more of the scene in focus.
  Image stabilization: Important for telephoto lenses and low-light shooting, it helps reduce blur from camera shake.
  Purpose: Think about what you’ll be photographing most often — landscapes, portraits, sports, etc. This will help you decide whether you need a wide-angle, telephoto, or prime lens.
  Each lens type serves a different purpose, so it's useful to match the lens to your specific needs, whether it’s for versatility, creativity, or focusing on detail.'
  `,
    },
    {

        title: "What is your best lens?",
        profileId: profileId,
        url: "bg/topic-2.jpeg",
        text: `
      Choosing your first camera can be exciting but also overwhelming with so many options on the market. Here’s a guide on what to consider when buying your first camera:
  
  1. Types of Cameras
  DSLR (Digital Single-Lens Reflex):
  Best for: Those who want control over settings, interchangeable lenses, and optical viewfinders.
  Pros: Versatile, durable, with long battery life, and a wide variety of lenses.
  Cons: Bulkier and heavier compared to mirrorless cameras.
  Mirrorless:
  Best for: Those who want a lighter, more compact option with advanced features.
  Pros: Lighter, often has advanced video features, and an electronic viewfinder (what you see on the screen is exactly what will be captured).
  Cons: Shorter battery life, fewer lens options compared to DSLR (though this is improving).
  Point-and-Shoot (Compact Cameras):
  Best for: Beginners who want a simple, portable camera for casual photography.
  Pros: Easy to use, compact, and affordable.
  Cons: Limited manual controls, fixed lens, and smaller sensor, which may reduce image quality.
  Bridge Cameras:
  Best for: People who want more control than a point-and-shoot but don’t need interchangeable lenses.
  Pros: Often have powerful zoom lenses, good for wildlife or sports photography.
  Cons: Bulky, and you can’t change lenses.
  2. Key Features to Consider
  Sensor Size:
  Full-Frame: Larger sensors, great for low-light performance, depth of field, and overall image quality. These are more expensive and found in higher-end DSLRs and mirrorless cameras.
  APS-C: Smaller than full-frame but still offers great image quality, commonly found in entry-level DSLRs and mirrorless cameras.
  Micro Four Thirds: Smaller sensor than APS-C but still produces high-quality images, especially in mirrorless cameras.
  Megapixels:
  Don’t get too caught up in the number of megapixels. For most beginner needs, 16-24MP is more than enough for high-quality images and even large prints.
  Interchangeable Lenses:
  If you want to grow with your camera, choosing a system that supports interchangeable lenses (DSLR or mirrorless) is a good idea. This allows you to experiment with different focal lengths and styles over time.
  Ease of Use (User Interface):
  Look for a camera with intuitive controls and menus. Some cameras, like entry-level DSLRs and mirrorless models, offer a “beginner mode” with easy-to-understand controls.
  Autofocus System:
  A fast and accurate autofocus system is essential for capturing moving subjects like kids, pets, or sports. Mirrorless cameras often have superior autofocus technology.
  Video Capabilities:
  If you’re interested in videography, consider a camera with strong video features, such as 4K recording, high frame rates, and external microphone inputs.
  Connectivity:
  Some cameras offer Wi-Fi, Bluetooth, or NFC for easy sharing of photos to your smartphone or laptop. This is a great feature for social media enthusiasts.
  3. Budget
  Entry-level DSLR or Mirrorless: Prices typically range from $400 to $800. These are great for beginners because they offer the flexibility to grow with your skills. Popular models include the Canon EOS Rebel series or the Nikon D3500 for DSLRs, and the Sony Alpha a6000 for mirrorless.
  
  Mid-range DSLR or Mirrorless: These cameras, ranging from $800 to $1,500, offer better build quality, faster performance, and more advanced features. Examples include the Canon EOS RP, Nikon Z50 (mirrorless), or the Canon EOS 90D (DSLR).
  
  4. Lenses and Accessories
  If you’re buying a DSLR or mirrorless camera, you’ll need lenses. Most beginners start with a “kit lens” (usually an 18-55mm lens), which is a good all-rounder.
  Over time, you can invest in more specialized lenses, such as a 50mm prime lens for portraits or a wide-angle lens for landscapes.
  Accessories to consider:
  Extra batteries and memory cards.
  Camera bag.
  Tripod for stability.
  Cleaning kit.
  5. Future-Proofing
  If you think you’ll be serious about photography in the future, invest in a camera system with room to grow. For example, Canon and Nikon DSLRs have a wide range of lenses and accessories available. Mirrorless systems from Sony, Fujifilm, and Panasonic are also rapidly expanding.
  6. Brands to Consider
  Canon: Great for beginners with a wide range of lenses and accessories.
  Nikon: Another popular choice for beginners and offers excellent image quality.
  Sony: Leading in the mirrorless market, known for fast autofocus and video capabilities.
  Fujifilm: Known for retro design, film simulation modes, and excellent image quality in its mirrorless cameras.
  Panasonic: Strong in the video market, great for videographers looking to shoot 4K footage.
  Conclusion
  When choosing your first camera, think about how you plan to use it (e.g., for travel, portraits, landscapes), your budget, and whether you want room to grow into more advanced photography. If possible, try out different cameras in a store to see which feels most comfortable in your hands. Starting with a versatile, easy-to-use camera is key, and you can always upgrade your gear as your skills improve!
  
          `,
    },

    {

        title: "How to choose the right film for your photos?",
        profileId: profileId,
        url: "bg/topic-3.jpeg",
        text: `
          Choosing the right film for your photos depends on the aesthetic you want to achieve and the shooting conditions. Here are key factors to consider:
  
  ### 1. **Film Speed (ISO)**
     - **Low ISO (25-100):** Ideal for bright, outdoor settings with plenty of light. Produces finer grain and sharper images, but requires more light.
     - **Medium ISO (200-400):** More versatile for a variety of lighting conditions, including indoor and outdoor scenes.
     - **High ISO (800 and above):** Best for low-light environments or fast-moving subjects, but higher grain and noise will appear.
  
  ### 2. **Color or Black & White**
     - **Color Film:** Great for capturing vivid and true-to-life colors. Popular color film brands include Kodak Portra (natural tones) and Fujifilm (vivid colors).
     - **Black & White Film:** Offers a timeless, classic look with strong contrast and mood. Ideal for portraits, architecture, and artistic shots.
  
  ### 3. **Grain and Texture**
     - **Fine Grain (Low ISO):** Produces smooth textures, making it ideal for landscapes or portraits.
     - **Coarse Grain (High ISO):** Adds a gritty, raw feel, often used for documentary or street photography.
  
  ### 4. **Film Type**
     - **Slide Film (Positive):** Produces more vibrant, saturated images with high contrast. Great for projection but less forgiving with exposure.
     - **Negative Film:** More forgiving with exposure errors and produces negatives that are easier to process.
  
  ### 5. **Color Temperature**
     - **Daylight-Balanced Film:** Designed for outdoor daylight shooting, minimizing color shifts in natural light.
     - **Tungsten-Balanced Film:** Corrects color shifts when shooting indoors under tungsten lighting, avoiding the yellow-orange cast.
  
  ### 6. **Personal Style**
     - Experiment with different film stocks. Kodak Portra is known for its soft skin tones, while Fujifilm’s stocks are more saturated and cooler.
     - Lomography films can offer experimental and unpredictable color effects for creative projects.
  
  ### 7. **Budget and Availability**
     - Some films are more expensive or harder to find. Decide on a budget and check availability, especially if you're trying something rare or discontinued.
  
  By experimenting with different film stocks, you can find the one that best suits your style and needs.
          `,
    },
];

export const getMessages = (
    profileId1: string,
    profileId2: string,
) => [
        {

            senderId: profileId2,
            receiverId: profileId1,
            text: "hello",
            date: new Date().toISOString(),
            type: "text",
        },
        {

            senderId: profileId1,
            receiverId: profileId2,
            text: "Good morning, How are You?",
            date: new Date().toISOString(),
            type: "text",
        },
        {

            senderId: profileId2,
            receiverId: profileId1,
            text: "I am fine. Thanks!",
            date: new Date().toISOString(),
            type: "text",
        },
        {

            senderId: profileId1,
            receiverId: profileId2,
            text: "What about tomorrow?",
            date: new Date().toISOString(),
            type: "text",
        },
    ];



export const getFolders = (profileId: string): Omit<IFolder, "id">[] => [
    {

        profileId: profileId,
        title: "Spain 2024 | MALAGA AND RONDA",
        bgColor: "#ffffff",
        color: "#000000",
        description: "Folder 1 Description",
        sortOrder: 1,
        url: "https://picsum.photos/id/28/400/300",
        privateAccess: 0,
    },
    {

        profileId: profileId,
        title: "PORTUGAL 2024 | PORTO",
        bgColor: "#ffffff",
        color: "#000000",
        description: "Folder 2 Description",
        sortOrder: 2,
        url: "https://picsum.photos/id/17/400/300",
        privateAccess: 0,
    },
    {

        profileId: profileId,
        title: "FRANCE 2024 | PARIS",
        bgColor: "#ffffff",
        color: "#000000",
        description: "Folder 3 Description",
        sortOrder: 3,
        url: "https://picsum.photos/id/10/400/300",
        privateAccess: 0,
    },
    {

        profileId: profileId,
        title: "GERMANY 2024 | FRANKFURT",
        bgColor: "#ffffff",
        color: "#000000",
        description: "Folder 4 Description",
        sortOrder: 4,
        url: "https://picsum.photos/id/22/400/300",
        privateAccess: 0,
    },
    {

        profileId: profileId,
        title: "USA 2024 | HOUSTON",
        bgColor: "#ffffff",
        color: "#000000",
        description: "Folder 5 Description",
        sortOrder: 5,
        url: "https://picsum.photos/id/21/400/300",
        privateAccess: 0,
    },
    {

        profileId: profileId,
        title: "ITALY 2024 | ROMA",
        bgColor: "#ffffff",
        color: "#000000",
        description: "Folder 6 Description",
        sortOrder: 6,
        url: "https://picsum.photos/id/15/400/300",
        privateAccess: 0,
    },
    {

        profileId: profileId,
        title: "JAPAN 2024 | TOKYO",
        bgColor: "#ffffff",
        color: "#000000",
        description: "Folder 7 Description",
        sortOrder: 7,
        url: "https://picsum.photos/id/12/400/300",
        privateAccess: 0,
    },
    {

        profileId: profileId,
        title: "CHINA 2024 | BEIJING",
        bgColor: "#ffffff",
        color: "#000000",
        description: "Folder 8 Description",
        sortOrder: 8,
        url: "https://picsum.photos/id/23/400/300",
        privateAccess: 0,
    },
    {

        profileId: profileId,
        title: "New Zealand 2024 | AUCKLAND",
        bgColor: "#ffffff",
        color: "#000000",
        description: "Folder 9 Description",
        sortOrder: 9,
        url: "https://picsum.photos/id/11/400/300",
        privateAccess: 0,
    },
];
