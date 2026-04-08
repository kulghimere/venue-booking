const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Venue = require('../models/Venue');
const Booking = require('../models/Booking');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/venue_booking');
  console.log('Connected to MongoDB');

  await User.deleteMany();
  await Venue.deleteMany();
  await Booking.deleteMany();
  console.log('Cleared existing data');

  // Distinct passwords per role — all meet 8-char + uppercase + number rules
  const adminPw    = await bcrypt.hash('Admin@9999', 12);   // Admin only
  const ownerPw    = await bcrypt.hash('Owner@1234', 12);   // Venue owners
  const userPw     = await bcrypt.hash('User@5678', 12);    // Regular users

  const admin  = await User.create({ firstName: 'Admin',  lastName: 'User',     email: 'admin@gmail.com',         password: adminPw, role: 'admin',       isEmailVerified: true, phone: '07700900001' });
  const owner1 = await User.create({ firstName: 'Sarah',  lastName: 'Mitchell', email: 'sarah.mitchell@gmail.com', password: ownerPw, role: 'venue_owner', isEmailVerified: true, phone: '07700900123' });
  const owner2 = await User.create({ firstName: 'James',  lastName: 'Chen',     email: 'james.chen@gmail.com',     password: ownerPw, role: 'venue_owner', isEmailVerified: true, phone: '07700900456' });
  const user1  = await User.create({ firstName: 'Kul',    lastName: 'Ghimire',  email: 'kulghimere@gmail.com',     password: userPw,  role: 'user',        isEmailVerified: true, phone: '07700900789' });
  const user2  = await User.create({ firstName: 'Emily',  lastName: 'Watson',   email: 'emily.watson@gmail.com',   password: userPw,  role: 'user',        isEmailVerified: true, phone: '07700900321' });
  console.log('Users created');

  const venues = await Venue.create([
    {
      name: 'The Grand Pavilion', owner: owner1._id,
      description: 'A stunning waterfront venue perfect for weddings, galas, and corporate events. Features panoramic views and state-of-the-art AV equipment.',
      category: 'wedding', capacity: 300, pricePerHour: 250,
      location: { address: '12 Harbour View', city: 'Glasgow', country: 'UK', coordinates: { lat: 55.8642, lng: -4.2518 } },
      amenities: ['WiFi', 'Parking', 'Catering Kitchen', 'AV Equipment', 'Climate Control', 'Bridal Suite'],
      rating: 4.8, reviewCount: 47, isActive: true,
      images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800']
    },
    {
      name: 'TechHub Conference Centre', owner: owner1._id,
      description: 'Modern conference facilities with cutting-edge technology infrastructure. Ideal for seminars, product launches, and corporate training.',
      category: 'conference', capacity: 150, pricePerHour: 180,
      location: { address: '45 Innovation Drive', city: 'Edinburgh', country: 'UK', coordinates: { lat: 55.9533, lng: -3.1883 } },
      amenities: ['High-Speed WiFi', 'Video Conferencing', 'Whiteboards', 'Projectors', 'Breakout Rooms', 'Catering Service'],
      rating: 4.6, reviewCount: 32, isActive: true,
      images: ['https://images.unsplash.com/photo-1511578314322-379afb476865?w=800']
    },
    {
      name: 'Riverside Sports Arena', owner: owner2._id,
      description: 'A multi-sport venue with Olympic-standard facilities for competitions, training camps, and community sports events.',
      category: 'sports', capacity: 500, pricePerHour: 120,
      location: { address: '78 Riverside Walk', city: 'Manchester', country: 'UK', coordinates: { lat: 53.4808, lng: -2.2426 } },
      amenities: ['Changing Rooms', 'Equipment Storage', 'Scoreboard', 'Spectator Seating', 'First Aid Room', 'Parking'],
      rating: 4.5, reviewCount: 28, isActive: true,
      images: ['https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800']
    },
    {
      name: 'The Metropolitan Gallery', owner: owner2._id,
      description: 'An elegant art deco space perfect for exhibitions, product showcases, and luxury corporate events in the heart of the city.',
      category: 'exhibition', capacity: 200, pricePerHour: 200,
      location: { address: '22 Cultural Quarter', city: 'London', country: 'UK', coordinates: { lat: 51.5074, lng: -0.1278 } },
      amenities: ['Gallery Lighting', 'Climate Control', 'Security', 'Loading Bay', 'Café Area', 'WiFi'],
      rating: 4.9, reviewCount: 61, isActive: true,
      images: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800']
    },
    {
      name: 'Garden Party Estate', owner: owner1._id,
      description: 'A beautifully landscaped outdoor venue with covered pavilions, ideal for garden parties, outdoor concerts, and summer festivals.',
      category: 'outdoor', capacity: 400, pricePerHour: 150,
      location: { address: '5 Green Lane', city: 'Bristol', country: 'UK', coordinates: { lat: 51.4545, lng: -2.5879 } },
      amenities: ['Covered Pavilion', 'Outdoor Stage', 'BBQ Facilities', 'Parking', 'Toilets', 'Lighting Rig'],
      rating: 4.7, reviewCount: 39, isActive: true,
      images: ['https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800']
    },
    {
      name: 'The Social Club', owner: owner2._id,
      description: 'An intimate social venue perfect for birthday parties, community gatherings, and casual corporate socials.',
      category: 'social', capacity: 80, pricePerHour: 75,
      location: { address: '9 Community Street', city: 'Leeds', country: 'UK', coordinates: { lat: 53.8008, lng: -1.5491 } },
      amenities: ['Bar', 'Dance Floor', 'Sound System', 'Pool Table', 'Outdoor Area', 'Kitchen'],
      rating: 4.3, reviewCount: 22, isActive: true,
      images: ['https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800']
    }
  ]);
  console.log('Venues created');

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 7);

  await Booking.create([
    {
      venue: venues[0]._id, user: user1._id, eventType: 'wedding', eventTitle: 'Ghimire-Sharma Wedding',
      guestCount: 200, date: nextWeek, startTime: '14:00', endTime: '22:00', totalHours: 8, totalPrice: 2000,
      status: 'confirmed', confirmedAt: new Date(), paymentStatus: 'paid'
    },
    {
      venue: venues[1]._id, user: user2._id, eventType: 'conference', eventTitle: 'Tech Innovation Summit 2026',
      guestCount: 100, date: tomorrow, startTime: '09:00', endTime: '17:00', totalHours: 8, totalPrice: 1440,
      status: 'confirmed', confirmedAt: new Date(), paymentStatus: 'paid'
    },
    {
      venue: venues[3]._id, user: user1._id, eventType: 'exhibition', eventTitle: 'Digital Art Showcase',
      guestCount: 150, date: new Date(), startTime: '10:00', endTime: '18:00', totalHours: 8, totalPrice: 1600,
      status: 'completed', confirmedAt: new Date(), paymentStatus: 'paid'
    }
  ]);
  console.log('Bookings created');

  console.log('\n✅ Database seeded successfully!\n');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    DEMO CREDENTIALS                         ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║  ADMIN PORTAL   → admin@venuebook.com  / Admin@9999         ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║  VENUE OWNER    → sarah@venuebook.com  / Owner@1234         ║');
  console.log('║  VENUE OWNER    → james@venuebook.com  / Owner@1234         ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║  USER           → kul@example.com      / User@5678          ║');
  console.log('║  USER           → emily@example.com    / User@5678          ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('\n⚠  Each role must sign in through its own portal on the frontend.\n');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });


  const venues = await Venue.create([
    {
      name: 'The Grand Pavilion', owner: owner1._id, description: 'A stunning waterfront venue perfect for weddings, galas, and corporate events. Features panoramic views and state-of-the-art AV equipment.',
      category: 'wedding', capacity: 300, pricePerHour: 250,
      location: { address: '12 Harbour View', city: 'Glasgow', country: 'UK', coordinates: { lat: 55.8642, lng: -4.2518 } },
      amenities: ['WiFi', 'Parking', 'Catering Kitchen', 'AV Equipment', 'Climate Control', 'Bridal Suite'],
      rating: 4.8, reviewCount: 47, isActive: true,
      images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800']
    },
    {
      name: 'TechHub Conference Centre', owner: owner1._id, description: 'Modern conference facilities with cutting-edge technology infrastructure. Ideal for seminars, product launches, and corporate training.',
      category: 'conference', capacity: 150, pricePerHour: 180,
      location: { address: '45 Innovation Drive', city: 'Edinburgh', country: 'UK', coordinates: { lat: 55.9533, lng: -3.1883 } },
      amenities: ['High-Speed WiFi', 'Video Conferencing', 'Whiteboards', 'Projectors', 'Breakout Rooms', 'Catering Service'],
      rating: 4.6, reviewCount: 32, isActive: true,
      images: ['https://images.unsplash.com/photo-1511578314322-379afb476865?w=800']
    },
    {
      name: 'Riverside Sports Arena', owner: owner2._id, description: 'A multi-sport venue with Olympic-standard facilities for competitions, training camps, and community sports events.',
      category: 'sports', capacity: 500, pricePerHour: 120,
      location: { address: '78 Riverside Walk', city: 'Manchester', country: 'UK', coordinates: { lat: 53.4808, lng: -2.2426 } },
      amenities: ['Changing Rooms', 'Equipment Storage', 'Scoreboard', 'Spectator Seating', 'First Aid Room', 'Parking'],
      rating: 4.5, reviewCount: 28, isActive: true,
      images: ['https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800']
    },
    {
      name: 'The Metropolitan Gallery', owner: owner2._id, description: 'An elegant art deco space perfect for exhibitions, product showcases, and luxury corporate events in the heart of the city.',
      category: 'exhibition', capacity: 200, pricePerHour: 200,
      location: { address: '22 Cultural Quarter', city: 'London', country: 'UK', coordinates: { lat: 51.5074, lng: -0.1278 } },
      amenities: ['Gallery Lighting', 'Climate Control', 'Security', 'Loading Bay', 'Café Area', 'WiFi'],
      rating: 4.9, reviewCount: 61, isActive: true,
      images: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800']
    },
    {
      name: 'Garden Party Estate', owner: owner1._id, description: 'A beautifully landscaped outdoor venue with covered pavilions, ideal for garden parties, outdoor concerts, and summer festivals.',
      category: 'outdoor', capacity: 400, pricePerHour: 150,
      location: { address: '5 Green Lane', city: 'Bristol', country: 'UK', coordinates: { lat: 51.4545, lng: -2.5879 } },
      amenities: ['Covered Pavilion', 'Outdoor Stage', 'BBQ Facilities', 'Parking', 'Toilets', 'Lighting Rig'],
      rating: 4.7, reviewCount: 39, isActive: true,
      images: ['https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800']
    },
    {
      name: 'The Social Club', owner: owner2._id, description: 'An intimate social venue perfect for birthday parties, community gatherings, and casual corporate socials.',
      category: 'social', capacity: 80, pricePerHour: 75,
      location: { address: '9 Community Street', city: 'Leeds', country: 'UK', coordinates: { lat: 53.8008, lng: -1.5491 } },
      amenities: ['Bar', 'Dance Floor', 'Sound System', 'Pool Table', 'Outdoor Area', 'Kitchen'],
      rating: 4.3, reviewCount: 22, isActive: true,
      images: ['https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800']
    }
  ]);
  console.log('Venues created');

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 7);

  await Booking.create([
    {
      venue: venues[0]._id, user: user1._id, eventType: 'wedding', eventTitle: 'Ghimire-Sharma Wedding',
      guestCount: 200, date: nextWeek, startTime: '14:00', endTime: '22:00', totalHours: 8, totalPrice: 2000,
      status: 'confirmed', confirmedAt: new Date(), paymentStatus: 'paid'
    },
    {
      venue: venues[1]._id, user: user2._id, eventType: 'conference', eventTitle: 'Tech Innovation Summit 2026',
      guestCount: 100, date: tomorrow, startTime: '09:00', endTime: '17:00', totalHours: 8, totalPrice: 1440,
      status: 'confirmed', confirmedAt: new Date(), paymentStatus: 'paid'
    },
    {
      venue: venues[3]._id, user: user1._id, eventType: 'exhibition', eventTitle: 'Digital Art Showcase',
      guestCount: 150, date: new Date(), startTime: '10:00', endTime: '18:00', totalHours: 8, totalPrice: 1600,
      status: 'completed', confirmedAt: new Date(), paymentStatus: 'paid'
    }
  ]);
  console.log('Bookings created');

  console.log('\n✅ Database seeded successfully!');
  console.log('\n--- Demo Accounts ---');
  console.log('Admin:        admin@venuebook.com   / password123');
  console.log('Venue Owner:  sarah@venuebook.com   / password123');
  console.log('Venue Owner:  james@venuebook.com   / password123');
  console.log('User:         kul@example.com       / password123');
  console.log('User:         emily@example.com     / password123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
