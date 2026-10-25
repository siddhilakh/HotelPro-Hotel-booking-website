import 'dotenv/config';
import Room from './models/Room.js';
import User from './models/User.js';
import Booking from './models/Booking.js';

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

const rooms = [
  {
    name: 'Serene Standard', type: 'Standard', price: 4500, capacity: 2, size: 28, bed: 'Queen', view: 'Garden',
    rating: 4.6, featured: false,
    description: 'A calm, light-filled retreat with a plush queen bed, a quiet work nook and a garden outlook. Everything you need, beautifully edited.',
    amenities: ['Free WiFi', 'Air conditioning', 'Smart TV', 'Rain shower', 'Coffee machine'],
    images: [img('photo-1611892440504-42a792e24d32'), img('photo-1631049307264-da0ec9d70304')],
  },
  {
    name: 'Urban Deluxe', type: 'Deluxe', price: 7200, capacity: 3, size: 38, bed: 'King', view: 'City',
    rating: 4.8, featured: true,
    description: 'Floor-to-ceiling windows frame the skyline. A king bed, a lounge corner and a marble bathroom make this our most-loved room.',
    amenities: ['Free WiFi', 'Air conditioning', 'Smart TV', 'Minibar', 'Marble bathroom', 'Work desk'],
    images: [img('photo-1582719478250-c89cae4dc85b'), img('photo-1618773928121-c32242e63f39')],
  },
  {
    name: 'Oceanview Deluxe', type: 'Deluxe', price: 8400, capacity: 3, size: 42, bed: 'King', view: 'Ocean',
    rating: 4.9, featured: true,
    description: 'Wake up to the horizon. A private balcony, soaking tub and curated minibar turn an ordinary morning into a ritual.',
    amenities: ['Free WiFi', 'Private balcony', 'Soaking tub', 'Minibar', 'Smart TV', 'Espresso machine'],
    images: [img('photo-1566665797739-1674de7a421a'), img('photo-1590490360182-c33d57733427')],
  },
  {
    name: 'Executive Suite', type: 'Suite', price: 12500, capacity: 4, size: 64, bed: 'King + Sofa bed', view: 'City',
    rating: 4.9, featured: true,
    description: 'A separate living room, dining table and walk-in wardrobe. Ideal for longer stays, families and business travellers who like space.',
    amenities: ['Free WiFi', 'Living room', 'Dining area', 'Butler service', 'Lounge access', 'Bathtub', 'Minibar'],
    images: [img('photo-1578683010236-d716f9a3f461'), img('photo-1584132967334-10e028bd69f7')],
  },
  {
    name: 'Royal Penthouse Suite', type: 'Suite', price: 18900, capacity: 4, size: 88, bed: 'Super King', view: 'Panoramic',
    rating: 5, featured: true,
    description: 'Top-floor privacy with a wraparound terrace, private plunge pool and 24-hour butler. The skyline is yours.',
    amenities: ['Private terrace', 'Plunge pool', '24h butler', 'Free WiFi', 'Lounge access', 'Home cinema', 'Premium bar'],
    images: [img('photo-1595576508898-0ad5c879a061'), img('photo-1596394516093-501ba68a0ba6')],
  },
  {
    name: 'The Presidential Residence', type: 'Presidential', price: 32000, capacity: 6, size: 160, bed: '2 × King', view: 'Panoramic',
    rating: 5, featured: false,
    description: 'Our signature residence: two bedrooms, a private dining room, library and a chauffeured car on call. Pure, quiet grandeur.',
    amenities: ['Two bedrooms', 'Private dining', 'Library', 'Chauffeur', '24h butler', 'Spa suite', 'Free WiFi'],
    images: [img('photo-1564501049412-61c2a3083791'), img('photo-1551882547-ff40c63fe5fa')],
  },
];

export async function seedIfEmpty({ force = false } = {}) {
  if (force) {
    await Promise.all([Room.deleteMany(), Booking.deleteMany(), User.deleteMany()]);
  }

  if (!(await User.exists({ role: 'admin' }))) {
    await User.create({ name: 'Hotel Admin', email: 'admin@hotelpro.com', password: 'Admin@123', role: 'admin' });
    await User.create({ name: 'Demo Guest', email: 'guest@hotelpro.com', password: 'Guest@123' });
    console.log('[seed] Created demo accounts (admin@hotelpro.com / Admin@123, guest@hotelpro.com / Guest@123)');
  }

  if (!(await Room.exists())) {
    await Room.insertMany(rooms);
    console.log(`[seed] Added ${rooms.length} rooms`);
  }
}

// `npm run seed` wipes and reseeds.
if (process.argv[1]?.endsWith('seed.js')) {
  const { connectDB } = await import('./db.js');
  await connectDB();
  await seedIfEmpty({ force: true });
  process.exit(0);
}
