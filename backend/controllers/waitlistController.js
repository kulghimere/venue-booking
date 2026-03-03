const Waitlist = require('../models/Waitlist');
const Venue = require('../models/Venue');

exports.getMyWaitlist = async (req, res) => {
  try {
    const entries = await Waitlist.find({ user: req.user._id, status: { $in: ['active', 'notified'] } })
      .populate('venue', 'name location images category pricePerHour')
      .sort('requestedDate');
    res.json({ success: true, waitlist: entries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.removeFromWaitlist = async (req, res) => {
  try {
    const entry = await Waitlist.findById(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: 'Waitlist entry not found' });
    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { venue, requestedDate, position } = entry;
    await entry.deleteOne();

    // Decrement position of all entries with higher position for same venue+date
    await Waitlist.updateMany(
      { venue, requestedDate, position: { $gt: position }, status: { $in: ['active', 'notified'] } },
      { $inc: { position: -1 } }
    );

    res.json({ success: true, message: 'Removed from waitlist' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getVenueWaitlist = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.venueId);
    if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });
    if (venue.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const entries = await Waitlist.find({ venue: req.params.venueId, status: { $in: ['active', 'notified'] } })
      .populate('user', 'firstName lastName email phone')
      .sort('requestedDate position');

    res.json({ success: true, waitlist: entries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
