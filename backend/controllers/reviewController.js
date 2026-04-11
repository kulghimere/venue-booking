const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Venue = require('../models/Venue');

exports.createReview = async (req, res) => {
  try {
    const { venueId, bookingId, rating, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (booking.venue.toString() !== venueId) {
      return res.status(400).json({ success: false, message: 'Booking does not match venue' });
    }
    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'You can only review completed bookings' });
    }

    const existing = await Review.findOne({ booking: bookingId });
    if (existing) return res.status(400).json({ success: false, message: 'You have already reviewed this booking' });

    const review = await Review.create({
      user: req.user._id,
      venue: venueId,
      booking: bookingId,
      rating,
      comment
    });

    const populated = await Review.findById(review._id).populate('user', 'firstName lastName avatar');
    res.status(201).json({ success: true, review: populated, message: 'Review submitted' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getVenueReviews = async (req, res) => {
  try {
    const { venueId, page = 1, limit = 10 } = req.query;
    if (!venueId) return res.status(400).json({ success: false, message: 'venueId is required' });
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [reviews, total] = await Promise.all([
      Review.find({ venue: venueId })
        .populate('user', 'firstName lastName avatar')
        .sort('-createdAt').skip(skip).limit(parseInt(limit)),
      Review.countDocuments({ venue: venueId })
    ]);
    res.json({ success: true, reviews, total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
