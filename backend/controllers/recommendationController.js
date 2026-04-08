const Venue = require('../models/Venue');
const Booking = require('../models/Booking');

// ML-inspired scoring algorithm (simulates trained model behavior)
const scoreVenue = (venue, userPrefs, bookingHistory) => {
  let score = 0;
  const weights = { rating: 0.25, capacity: 0.20, price: 0.20, category: 0.20, location: 0.15 };

  // Rating score (0-1)
  score += (venue.rating / 5) * weights.rating;

  // Capacity match score
  if (userPrefs.guestCount) {
    const capacityRatio = Math.min(userPrefs.guestCount / venue.capacity, 1);
    const capacityScore = capacityRatio > 0.5 ? 1 - Math.abs(capacityRatio - 0.8) : capacityRatio;
    score += Math.max(0, capacityScore) * weights.capacity;
  } else {
    score += 0.5 * weights.capacity;
  }

  // Price match score
  if (userPrefs.maxBudget) {
    const priceScore = venue.pricePerHour <= userPrefs.maxBudget ? 1 : userPrefs.maxBudget / venue.pricePerHour;
    score += Math.max(0, priceScore) * weights.price;
  } else {
    score += 0.5 * weights.price;
  }

  // Category preference
  if (userPrefs.eventType && venue.category === userPrefs.eventType) {
    score += 1 * weights.category;
  } else if (userPrefs.eventType) {
    score += 0.2 * weights.category;
  } else {
    score += 0.5 * weights.category;
  }

  // Historical booking preference (collaborative filtering simulation)
  if (bookingHistory.length > 0) {
    const sameCategoryCount = bookingHistory.filter(b => b.venue?.category === venue.category).length;
    const historyScore = Math.min(sameCategoryCount / 3, 1);
    score += historyScore * weights.location;
  } else {
    score += 0.3 * weights.location;
  }

  // Seasonal demand adjustment
  const month = new Date().getMonth();
  const isHighSeason = [5, 6, 7, 11].includes(month);
  if (isHighSeason && venue.reviewCount > 10) score += 0.05;

  return Math.min(score, 1);
};

exports.getRecommendations = async (req, res) => {
  try {
    const { eventType, guestCount, maxBudget, city, date } = req.query;

    const bookingHistory = await Booking.find({ user: req.user._id, status: { $in: ['confirmed', 'completed'] } })
      .populate('venue', 'category name').limit(20);

    const query = { isActive: true };
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (guestCount) query.capacity = { $gte: parseInt(guestCount) };
    if (maxBudget) query.pricePerHour = { $lte: parseFloat(maxBudget) };

    const venues = await Venue.find(query).populate('owner', 'firstName lastName').limit(50);

    const userPrefs = { eventType, guestCount: parseInt(guestCount), maxBudget: parseFloat(maxBudget) };

    const scored = venues.map(v => ({
      venue: v,
      score: scoreVenue(v, userPrefs, bookingHistory),
      reasons: generateReasons(v, userPrefs, bookingHistory)
    })).sort((a, b) => b.score - a.score).slice(0, 6);

    // Demand forecast (simple heuristic)
    const demandForecast = await getDemandForecast(date);

    res.json({ success: true, recommendations: scored, demandForecast, algorithm: 'ml_scoring_v1' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const generateReasons = (venue, prefs, history) => {
  const reasons = [];
  if (venue.rating >= 4.5) reasons.push('Top rated venue');
  if (prefs.guestCount && venue.capacity >= prefs.guestCount && venue.capacity <= prefs.guestCount * 1.3) reasons.push('Perfect capacity match');
  if (prefs.maxBudget && venue.pricePerHour <= prefs.maxBudget * 0.8) reasons.push('Within your budget');
  if (prefs.eventType && venue.category === prefs.eventType) reasons.push('Matches your event type');
  const prevBookings = history.filter(b => b.venue?.category === venue.category).length;
  if (prevBookings > 0) reasons.push(`You've booked similar venues before`);
  if (venue.reviewCount > 20) reasons.push('Highly reviewed');
  return reasons.slice(0, 3);
};

const getDemandForecast = async (date) => {
  const targetDate = date ? new Date(date) : new Date();
  const startOfWeek = new Date(targetDate);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  const recentBookings = await Booking.countDocuments({
    createdAt: { $gte: startOfWeek },
    status: { $in: ['confirmed', 'pending'] }
  });

  const dayOfWeek = targetDate.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const month = targetDate.getMonth();
  const isHighSeason = [5, 6, 7, 11].includes(month);

  let demandLevel = 'moderate';
  let demandScore = 0.5;

  if (isHighSeason && isWeekend) { demandLevel = 'very_high'; demandScore = 0.9; }
  else if (isHighSeason || isWeekend) { demandLevel = 'high'; demandScore = 0.7; }
  else if (recentBookings < 5) { demandLevel = 'low'; demandScore = 0.3; }

  return { demandLevel, demandScore, recentBookings, isHighSeason, isWeekend, recommendation: getDemandMessage(demandLevel) };
};

const getDemandMessage = (level) => ({
  very_high: 'Peak demand period — book immediately to secure your venue',
  high: 'High demand expected — early booking recommended',
  moderate: 'Moderate demand — good availability expected',
  low: 'Low demand period — great deals may be available'
})[level];

exports.getSimilarVenues = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });

    const similar = await Venue.find({
      _id: { $ne: venue._id },
      isActive: true,
      $or: [
        { category: venue.category },
        { 'location.city': venue.location.city },
        { capacity: { $gte: venue.capacity * 0.7, $lte: venue.capacity * 1.3 } }
      ]
    }).limit(4);

    res.json({ success: true, venues: similar });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
