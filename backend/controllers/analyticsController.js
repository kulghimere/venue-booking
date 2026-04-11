const Booking = require('../models/Booking');
const Venue   = require('../models/Venue');
const User    = require('../models/User');
const Review  = require('../models/Review');

// ── Public stats (no auth required) ──────────────────────────────────────────
exports.getPublicStats = async (req, res) => {
  try {
    const [
      totalVenues,
      totalBookings,
      completedBookings,
      totalUsers,
      ratingAgg,
      totalReviews,
      topCategoryAgg,
    ] = await Promise.all([
      Venue.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'completed' }),
      User.countDocuments({ isEmailVerified: true }),
      Review.aggregate([
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
      ]),
      Review.countDocuments(),
      Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'completed'] } } },
        { $lookup: { from: 'venues', localField: 'venue', foreignField: '_id', as: 'v' } },
        { $unwind: '$v' },
        { $group: { _id: '$v.category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),
    ]);

    const avgRating       = ratingAgg[0]?.avg ?? 0;
    const satisfactionPct = totalReviews > 0
      ? Math.round((avgRating / 5) * 100)
      : 0;

    res.json({
      success: true,
      stats: {
        totalVenues,
        totalBookings,
        completedBookings,
        totalUsers,
        avgRating:       Math.round(avgRating * 10) / 10,
        totalReviews,
        satisfactionPct,
        topCategory:     topCategoryAgg[0]?._id || null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    if (req.user.role === 'admin') {
      const [totalUsers, totalVenues, totalBookings, monthlyBookings, revenue] = await Promise.all([
        User.countDocuments(),
        Venue.countDocuments({ isActive: true }),
        Booking.countDocuments(),
        Booking.countDocuments({ createdAt: { $gte: startOfMonth } }),
        Booking.aggregate([{ $match: { status: 'confirmed' } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }])
      ]);
      return res.json({ success: true, stats: { totalUsers, totalVenues, totalBookings, monthlyBookings, totalRevenue: revenue[0]?.total || 0 } });
    }

    if (req.user.role === 'venue_owner') {
      const venues = await Venue.find({ owner: req.user._id }).select('_id');
      const venueIds = venues.map(v => v._id);
      const [totalBookings, pendingBookings, confirmedBookings, revenue] = await Promise.all([
        Booking.countDocuments({ venue: { $in: venueIds } }),
        Booking.countDocuments({ venue: { $in: venueIds }, status: 'pending' }),
        Booking.countDocuments({ venue: { $in: venueIds }, status: 'confirmed' }),
        Booking.aggregate([{ $match: { venue: { $in: venueIds }, status: 'confirmed' } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }])
      ]);
      return res.json({ success: true, stats: { totalVenues: venues.length, totalBookings, pendingBookings, confirmedBookings, totalRevenue: revenue[0]?.total || 0 } });
    }

    // Regular user stats
    const [totalBookings, upcomingBookings, completedBookings] = await Promise.all([
      Booking.countDocuments({ user: req.user._id }),
      Booking.countDocuments({ user: req.user._id, status: 'confirmed', date: { $gte: now } }),
      Booking.countDocuments({ user: req.user._id, status: 'completed' })
    ]);

    res.json({ success: true, stats: { totalBookings, upcomingBookings, completedBookings } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBookingTrends = async (req, res) => {
  try {
    const trends = await Booking.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } },
      { $sort: { _id: 1 } }
    ]);
    res.json({ success: true, trends });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCategoryStats = async (req, res) => {
  try {
    const stats = await Venue.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 }, avgRating: { $avg: '$rating' }, avgPrice: { $avg: '$pricePerHour' } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
