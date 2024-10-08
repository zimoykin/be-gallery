const cameras = () => {
    const list = [
        'Canon R7',
        'Canon R5',
        'Sony A7 III',
        'Fujifilm X-T30',
        'Sony A7 IV',
        'iPhone 15Pro',
        'Canon EOS 650D',
        'Google Pixel 7 Pro',
    ];

    return list[Math.floor(Math.random() * list.length)];
};

const lenses = () => {
    const list = [
        'Canon RF 35-80mm F/4-5.6 IS II USM',
        'Sony 28-45mm F/3.5-5.6 OSS',
        'no information',
        'main camera lens'
    ];

    return list[Math.floor(Math.random() * list.length)];
};

const locations = () => {
    const list = [
        'Berlin, Germany',
        'London, UK',
        'Los Angeles, USA',
        'Lisbon, Portugal',
        'Regensburg, Germany',
        'Paris, France',
        'Madrid, Spain',
        'New York, USA',
        'Sydney, Australia',
        'Munich, Germany',
        'Tokyo, Japan',
        'Kyoto, Japan',
        'Porto, Portugal',
    ];

    return list[Math.floor(Math.random() * list.length)];
};

export const seedPhotos = () => {
    const urls = [
        'https://images.pexels.com/photos/4591752/pexels-photo-4591752.jpeg',
        'https://images.pexels.com/photos/5231884/pexels-photo-5231884.jpeg',
        'https://images.pexels.com/photos/12249409/pexels-photo-12249409.jpeg',
        'https://images.pexels.com/photos/2677831/pexels-photo-2677831.jpeg',
        'https://images.pexels.com/photos/1819631/pexels-photo-1819631.jpeg',
        'https://images.pexels.com/photos/3178881/pexels-photo-3178881.jpeg',
        'https://images.pexels.com/photos/28733751/pexels-photo-28733751.jpeg',
        'https://images.pexels.com/photos/8311559/pexels-photo-8311559.jpeg',
        'https://images.pexels.com/photos/13659374/pexels-photo-13659374.jpeg',
        'https://images.pexels.com/photos/15254147/pexels-photo-15254147.jpeg',
        'https://images.pexels.com/photos/11331723/pexels-photo-11331723.jpeg',
        'https://images.pexels.com/photos/27041517/pexels-photo-27041517.jpeg',
        'https://images.pexels.com/photos/28305233/pexels-photo-28305233.jpeg',
        'https://images.pexels.com/photos/28683066/pexels-photo-28683066.jpeg',
        'https://images.pexels.com/photos/28573322/pexels-photo-28573322.jpeg',
        'https://images.pexels.com/photos/27833590/pexels-photo-27833590.jpeg',
        'https://images.pexels.com/photos/28518085/pexels-photo-28518085.jpeg',
        'https://images.pexels.com/photos/28770118/pexels-photo-28770118.jpeg',
        'https://images.pexels.com/photos/27566893/pexels-photo-27566893.jpeg',
        'https://images.pexels.com/photos/27569516/pexels-photo-27569516.jpeg',
        'https://images.pexels.com/photos/28353017/pexels-photo-28353017.jpeg',
        'https://images.pexels.com/photos/28303871/pexels-photo-28303871.jpeg',
        'https://images.pexels.com/photos/28098286/pexels-photo-28098286.jpeg'

    ];

    const basePhoto = {
        camera: cameras(),
        lens: lenses(),
        location: locations(),
        film: Math.floor(10 * Math.random()) > 5 ? 'KODAK PORTRA 800' : 'KODAK ULTRAMAX 400',
        iso: Math.floor(10 * Math.random()) > 5 ? '200' : '400',
        sortOrder: 1,
        description: 'This is a description',
        privateAccess: 0,
    };

    return urls.map((url, index) => ({
        ...basePhoto,
        url,
        sortOrder: index + 1
    }));
};
