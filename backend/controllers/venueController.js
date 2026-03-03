const Venue = require('../models/Venue');
const Booking = require('../models/Booking');

exports.getVenues = async (req, res) => {
  try {
    const { category, city, minCapacity, maxPrice, search, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (minCapacity) query.capacity = { $gte: parseInt(minCapacity) };
    if (maxPrice) query.pricePerHour = { $lte: parseFloat(maxPrice) };
    if (search) query.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const venues = await Venue.find(query).populate('owner', 'firstName lastName email').skip(skip).limit(parseInt(limit)).sort('-createdAt');
    const total = await Venue.countDocuments(query);

    res.json({ success: true, venues, total, pages: Math.ceil(total / limit), currentPage: parseInt(page) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getVenue = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id).populate('owner', 'firstName lastName email phone');
    if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });
    res.json({ success: true, venue });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createVenue = async (req, res) => {
  try {
    const venue = await Venue.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ success: true, venue });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateVenue = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });
    if (venue.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const updated = await Venue.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, venue: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteVenue = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });
    if (venue.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await venue.deleteOne();
    res.json({ success: true, message: 'Venue deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getVenueAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });

    const bookings = await Booking.find({
      venue: req.params.id,
      date: new Date(date),
      status: { $in: ['confirmed', 'pending'] }
    }).select('startTime endTime status');

    const allSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
    const availability = allSlots.map(time => {
      const booked = bookings.some(b => b.startTime <= time && b.endTime > time);
      return { time, available: !booked };
    });

    res.json({ success: true, availability, bookings: bookings.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyVenues = async (req, res) => {
  try {
    const venues = await Venue.find({ owner: req.user._id }).sort('-createdAt');
    res.json({ success: true, venues });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
