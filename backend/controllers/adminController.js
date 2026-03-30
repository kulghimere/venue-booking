const User = require('../models/User');
const Booking = require('../models/Booking');
const Venue = require('../models/Venue');

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort('-createdAt').skip(skip).limit(parseInt(limit)),
      User.countDocuments(query)
    ]);
    res.json({ success: true, users, total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'venue_owner', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot change your own role' });
    }
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    // Prevent demoting the last admin
    if (target.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        return res.status(400).json({ success: false, message: 'Cannot demote the last admin' });
      }
    }

    target.role = role;
    await target.save();
    res.json({ success: true, user: target, message: 'Role updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    const activeBookings = await Booking.countDocuments({
      user: req.params.id,
      status: { $in: ['confirmed', 'pending'] }
    });
    if (activeBookings > 0) {
      return res.status(400).json({ success: false, message: 'User has active bookings. Cancel them first.' });
    }

    target.isActive = false;
    await target.save();
    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, venueId, userId, dateFrom, dateTo } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = {};
    if (status) query.status = status;
    if (venueId) query.venue = venueId;
    if (userId) query.user = userId;
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('user', 'firstName lastName email')
        .populate('venue', 'name location category')
        .sort('-createdAt').skip(skip).limit(parseInt(limit)),
      Booking.countDocuments(query)
    ]);
    res.json({ success: true, bookings, total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllVenues = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [venues, total] = await Promise.all([
      Venue.find({}).populate('owner', 'firstName lastName email').sort('-createdAt').skip(skip).limit(parseInt(limit)),
      Venue.countDocuments({})
    ]);
    res.json({ success: true, venues, total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleVenueActive = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });
    venue.isActive = !venue.isActive;
    await venue.save();
    res.json({ success: true, venue, message: `Venue ${venue.isActive ? 'activated' : 'deactivated'}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRevenueReport = async (req, res) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const revenue = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] }, date: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          revenue: { $sum: '$totalPrice' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
    }

    const report = months.map(({ year, month }) => {
      const found = revenue.find(r => r._id.year === year && r._id.month === month);
      return {
        month: new Date(year, month - 1, 1).toLocaleString('default', { month: 'short', year: '2-digit' }),
        revenue: found ? found.revenue : 0,
        bookings: found ? found.bookings : 0
      };
    });

    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTopVenues = async (req, res) => {
  try {
    const top = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      {
        $group: {
          _id: '$venue',
          bookingCount: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'venues',
          localField: '_id',
          foreignField: '_id',
          as: 'venue'
        }
      },
      { $unwind: '$venue' },
      {
        $project: {
          name: '$venue.name',
          city: '$venue.location.city',
          category: '$venue.category',
          image: { $arrayElemAt: ['$venue.images', 0] },
          bookingCount: 1,
          revenue: 1
        }
      }
    ]);
    res.json({ success: true, venues: top });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
