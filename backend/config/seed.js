const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Venue = require('../models/Venue');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Waitlist = require('../models/Waitlist');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/venue_booking');
  console.log('Connected to MongoDB');

  await Review.deleteMany();
  await Waitlist.deleteMany();
  await Booking.deleteMany();
  await Venue.deleteMany();
  await User.deleteMany();
  console.log('Cleared existing data');

  const adminPw = await bcrypt.hash('Admin@9999', 12);
  const ownerPw = await bcrypt.hash('Owner@1234', 12);
  const userPw  = await bcrypt.hash('User@5678', 12);

  const admin  = await User.create({ firstName: 'Admin',  lastName: 'User',     email: 'admin@gmail.com',         password: adminPw, role: 'admin',       isEmailVerified: true, phone: '+447700900001' });
  const owner1 = await User.create({ firstName: 'Sarah',  lastName: 'Mitchell', email: 'sarah.mitchell@gmail.com', password: ownerPw, role: 'venue_owner', isEmailVerified: true, phone: '+447700900123' });
  const owner2 = await User.create({ firstName: 'James',  lastName: 'Chen',     email: 'james.chen@gmail.com',     password: ownerPw, role: 'venue_owner', isEmailVerified: true, phone: '+447700900456' });
  const user1  = await User.create({ firstName: 'Kul',    lastName: 'Ghimire',  email: 'kulghimere@gmail.com',     password: userPw,  role: 'user',        isEmailVerified: true, phone: '+447700900789' });
  const user2  = await User.create({ firstName: 'Emily',  lastName: 'Watson',   email: 'emily.watson@gmail.com',   password: userPw,  role: 'user',        isEmailVerified: true, phone: '+447700900321' });
  console.log('Users created');

  const venues = await Venue.create([
    {
      name: 'The Grand Pavilion', owner: owner1._id,
      description: 'A stunning waterfront venue perfect for weddings, galas, and corporate events. Features panoramic views and state-of-the-art AV equipment.',
      category: 'wedding', capacity: 300, pricePerHour: 250,
      location: { address: '12 Harbour View', city: 'Glasgow', country: 'UK', coordinates: { lat: 55.8642, lng: -4.2518 } },
      amenities: ['WiFi', 'Parking', 'Catering Kitchen', 'AV Equipment', 'Climate Control'],
      rating: 4.8, reviewCount: 47, isActive: true,
      images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800']
    },
    {
      name: 'TechHub Conference Centre', owner: owner1._id,
      description: 'Modern conference facilities with cutting-edge technology infrastructure. Ideal for seminars, product launches, and corporate training.',
      category: 'conference', capacity: 150, pricePerHour: 180,
      location: { address: '45 Innovation Drive', city: 'Edinburgh', country: 'UK', coordinates: { lat: 55.9533, lng: -3.1883 } },
      amenities: ['WiFi', 'Projectors', 'AV Equipment', 'Climate Control'],
      rating: 4.6, reviewCount: 32, isActive: true,
      images: ['https://images.unsplash.com/photo-1511578314322-379afb476865?w=800']
    },
    {
      name: 'Riverside Sports Arena', owner: owner2._id,
      description: 'A multi-sport venue with Olympic-standard facilities for competitions, training camps, and community sports events.',
      category: 'sports', capacity: 500, pricePerHour: 120,
      location: { address: '78 Riverside Walk', city: 'Manchester', country: 'UK', coordinates: { lat: 53.4808, lng: -2.2426 } },
      amenities: ['Changing Rooms', 'Parking', 'Security'],
      rating: 4.5, reviewCount: 28, isActive: true,
      images: ['https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800']
    },
    {
      name: 'The Metropolitan Gallery', owner: owner2._id,
      description: 'An elegant art deco space perfect for exhibitions, product showcases, and luxury corporate events in the heart of the city.',
      category: 'exhibition', capacity: 200, pricePerHour: 200,
      location: { address: '22 Cultural Quarter', city: 'London', country: 'UK', coordinates: { lat: 51.5074, lng: -0.1278 } },
      amenities: ['Climate Control', 'Security', 'WiFi'],
      rating: 4.9, reviewCount: 61, isActive: true,
      images: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800']
    },
    {
      name: 'Garden Party Estate', owner: owner1._id,
      description: 'A beautifully landscaped outdoor venue with covered pavilions, ideal for garden parties, outdoor concerts, and summer festivals.',
      category: 'outdoor', capacity: 400, pricePerHour: 150,
      location: { address: '5 Green Lane', city: 'Bristol', country: 'UK', coordinates: { lat: 51.4545, lng: -2.5879 } },
      amenities: ['Parking', 'Sound System', 'Outdoor Area'],
      rating: 4.7, reviewCount: 39, isActive: true,
      images: ['https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800']
    },
    {
      name: 'The Social Club', owner: owner2._id,
      description: 'An intimate social venue perfect for birthday parties, community gatherings, and casual corporate socials.',
      category: 'social', capacity: 80, pricePerHour: 75,
      location: { address: '9 Community Street', city: 'Leeds', country: 'UK', coordinates: { lat: 53.8008, lng: -1.5491 } },
      amenities: ['Bar', 'Dance Floor', 'Sound System'],
      rating: 4.3, reviewCount: 22, isActive: true,
      images: ['https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800']
    }
  ]);
  console.log('Venues created');

  const past1 = new Date(); past1.setDate(past1.getDate() - 30);
  const past2 = new Date(); past2.setDate(past2.getDate() - 15);
  const past3 = new Date(); past3.setDate(past3.getDate() - 7);
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 7);

  const bookings = await Booking.create([
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
      guestCount: 150, date: past1, startTime: '10:00', endTime: '18:00', totalHours: 8, totalPrice: 1600,
      status: 'completed', confirmedAt: past1, paymentStatus: 'paid'
    },
    {
      venue: venues[2]._id, user: user2._id, eventType: 'sports', eventTitle: 'Regional Athletics Meet',
      guestCount: 300, date: past2, startTime: '08:00', endTime: '16:00', totalHours: 8, totalPrice: 960,
      status: 'completed', confirmedAt: past2, paymentStatus: 'paid'
    },
    {
      venue: venues[4]._id, user: user1._id, eventType: 'social', eventTitle: 'Summer Garden Party',
      guestCount: 200, date: past3, startTime: '12:00', endTime: '20:00', totalHours: 8, totalPrice: 1200,
      status: 'completed', confirmedAt: past3, paymentStatus: 'paid'
    }
  ]);
  console.log('Bookings created');

  // Seed reviews (only for completed bookings)
  await Review.create([
    {
      user: user1._id, venue: venues[3]._id, booking: bookings[2]._id,
      rating: 5, comment: 'Absolutely stunning gallery space. The lighting and layout were perfect for our exhibition. Highly recommend!'
    },
    {
      user: user2._id, venue: venues[2]._id, booking: bookings[3]._id,
      rating: 4, comment: 'Great facilities for the athletics meet. Changing rooms were clean and the scoreboard worked perfectly.'
    },
    {
      user: user1._id, venue: venues[4]._id, booking: bookings[4]._id,
      rating: 5, comment: 'The Garden Party Estate exceeded all expectations. Our guests loved the outdoor pavilion!'
    }
  ]);

  // Update venue ratings after seeding reviews
  await Venue.findByIdAndUpdate(venues[3]._id, { rating: 5.0, reviewCount: 1 });
  await Venue.findByIdAndUpdate(venues[2]._id, { rating: 4.0, reviewCount: 1 });
  await Venue.findByIdAndUpdate(venues[4]._id, { rating: 5.0, reviewCount: 1 });
  console.log('Reviews created');

  // Seed waitlist entries
  const futureDate = new Date(); futureDate.setDate(futureDate.getDate() + 3);
  const futureDate2 = new Date(); futureDate2.setDate(futureDate2.getDate() + 5);

  await Waitlist.create([
    {
      user: user1._id, venue: venues[0]._id,
      requestedDate: futureDate, startTime: '14:00', endTime: '22:00',
      guestCount: 250, position: 1, status: 'active',
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
    },
    {
      user: user2._id, venue: venues[0]._id,
      requestedDate: futureDate, startTime: '14:00', endTime: '22:00',
      guestCount: 200, position: 2, status: 'active',
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
    },
    {
      user: user1._id, venue: venues[1]._id,
      requestedDate: futureDate2, startTime: '09:00', endTime: '17:00',
      guestCount: 100, position: 1, status: 'notified',
      notifiedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    },
    {
      user: user2._id, venue: venues[3]._id,
      requestedDate: futureDate, startTime: '10:00', endTime: '18:00',
      guestCount: 180, position: 1, status: 'active',
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
    },
    {
      user: user1._id, venue: venues[4]._id,
      requestedDate: futureDate2, startTime: '12:00', endTime: '20:00',
      guestCount: 350, position: 1, status: 'active',
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
    }
  ]);
  console.log('Waitlist entries created');

  console.log('\n✅ Database seeded successfully!\n');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    DEMO CREDENTIALS                         ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║  ADMIN          → admin@gmail.com          / Admin@9999     ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║  VENUE OWNER    → sarah.mitchell@gmail.com / Owner@1234     ║');
  console.log('║  VENUE OWNER    → james.chen@gmail.com     / Owner@1234     ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║  USER           → kulghimere@gmail.com     / User@5678      ║');
  console.log('║  USER           → emily.watson@gmail.com   / User@5678      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
