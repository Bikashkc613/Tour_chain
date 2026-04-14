const mongoose = require('mongoose');
const Place = require('../src/models/Place');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tourismchain';

const demoPlaces = [
  { 
    placeId: 'everest', name: 'Everest Base Camp', region: 'Himalaya', 
    description: 'The roof of the world.', 
    imageUrl: '/images/everest%20base%20camp.jpg',
    nftImageUrl: '/images/everest%20base%20camp.jpg',
    qrSecret: 'SECRET123' 
  },
  { 
    placeId: 'kathmandu', name: 'Kathmandu Durbar Square', region: 'Kathmandu', 
    description: 'Ancient royal architecture.', 
    imageUrl: '/images/Kathmandu%20Durbar%20Square.jpg',
    nftImageUrl: '/images/Kathmandu%20Durbar%20Square.jpg',
    qrSecret: 'SECRET123' 
  },
  { 
    placeId: 'pokhara', name: 'Phewa Lake', region: 'Pokhara', 
    description: 'Crystal clear waters.', 
    imageUrl: '/images/Phewa%20Lake.jpg',
    nftImageUrl: '/images/Phewa%20Lake.jpg',
    qrSecret: 'SECRET123' 
  },
  { 
    placeId: 'lumbini', name: 'Lumbini (Maya Devi Temple)', region: 'Rupandehi', 
    description: 'Birthplace of Lord Buddha.', 
    imageUrl: '/images/Lumbini%20(Maya%20Devi%20Temple).jpg',
    nftImageUrl: '/images/Lumbini%20(Maya%20Devi%20Temple).jpg',
    qrSecret: 'SECRET123' 
  },
  { 
    placeId: 'chitwan', name: 'Chitwan National Park', region: 'Terai', 
    description: 'Wild heart of the jungle.', 
    imageUrl: '/images/Chitwan%20National%20Park.jpg',
    nftImageUrl: '/images/Chitwan%20National%20Park.jpg',
    qrSecret: 'SECRET123' 
  },
  { 
    placeId: 'mustang', name: 'Upper Mustang', region: 'Mustang', 
    description: 'Hidden kingdom.', 
    imageUrl: '/images/Upper%20Mustang.jpg',
    nftImageUrl: '/images/Upper%20Mustang.jpg',
    qrSecret: 'SECRET123' 
  },
  { 
    placeId: 'bhaktapur', name: 'Bhaktapur Durbar Square', region: 'Bhaktapur', 
    description: 'City of devotees.', 
    imageUrl: '/images/Bhaktapur%20Durbar%20Square.jpg',
    nftImageUrl: '/images/Bhaktapur%20Durbar%20Square.jpg',
    qrSecret: 'SECRET123' 
  },
  { 
    placeId: 'janakpur', name: 'Janaki Mandir', region: 'Janakpur', 
    description: 'Magnificent marble temple.', 
    imageUrl: '/images/Janaki%20Mandir.jpg',
    nftImageUrl: '/images/Janaki%20Mandir.jpg',
    qrSecret: 'SECRET123' 
  },
  { 
    placeId: 'gorkha', name: 'Gorkha Durbar', region: 'Gorkha', 
    description: 'Historic home of Shah dynasty.', 
    imageUrl: '/images/Gorkha%20Durbar.jpg',
    nftImageUrl: '/images/Gorkha%20Durbar.jpg',
    qrSecret: 'SECRET123' 
  },
  { 
    placeId: 'manang', name: 'Manang Valley', region: 'Manang', 
    description: 'Hidden alpine scenery.', 
    imageUrl: '/images/Manang%20Valley.jpg',
    nftImageUrl: '/images/Manang%20Valley.jpg',
    qrSecret: 'SECRET123' 
  },
  { 
    placeId: 'rara', name: 'Rara Lake', region: 'Mugu', 
    description: 'Deepest lake in Nepal.', 
    imageUrl: '/images/Rara%20Lake.jpg',
    nftImageUrl: '/images/Rara%20Lake.jpg',
    qrSecret: 'SECRET123' 
  },
  { 
    placeId: 'nagarkot', name: 'Nagarkot', region: 'Bhaktapur', 
    description: 'Panoramic Himalayan views.', 
    imageUrl: '/images/Nagarkot.jpg',
    nftImageUrl: '/images/Nagarkot.jpg',
    qrSecret: 'SECRET123' 
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    for (const p of demoPlaces) {
      await Place.findOneAndUpdate({ placeId: p.placeId }, p, { upsert: true });
      console.log(`Updated Badge Image for: ${p.name}`);
    }

    console.log('Database NFT metadata sync complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
