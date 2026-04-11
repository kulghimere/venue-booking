const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const Waitlist = require('../models/Waitlist');

const calcHours = (start, end) => {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return ((eh * 60 + em) - (sh * 60 + sm)) / 60;
};

exports.createBooking = async (req, res) => {
  try {
    const { venueId, eventType, eventTitle, guestCount, date, startTime, endTime, specialRequests } = req.body;
    const venue = await Venue.findById(venueId);
    if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });
    if (guestCount > venue.capacity) {
      return res.status(400).json({ success: false, message: `Venue capacity is ${venue.capacity}, you requested ${guestCount}` });
    }

    const conflict = await Booking.findOne({
      venue: venueId,
      date: new Date(date),
      status: 'confirmed',
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    const totalHours = calcHours(startTime, endTime);
    const totalPrice = totalHours * venue.pricePerHour;

    if (conflict) {
      const waitlistCount = await Booking.countDocuments({ venue: venueId, date: new Date(date), status: 'waitlisted' });
      const booking = await Booking.create({
        venue: venueId, user: req.user._id, eventType, eventTitle, guestCount,
        date: new Date(date), startTime, endTime, totalHours, totalPrice,
        status: 'waitlisted', waitlistPosition: waitlistCount + 1, specialRequests
      });
      return res.status(201).json({ success: true, booking, waitlisted: true, position: waitlistCount + 1 });
    }

    const booking = await Booking.create({
      venue: venueId, user: req.user._id, eventType, eventTitle, guestCount,
      date: new Date(date), startTime, endTime, totalHours, totalPrice,
      status: 'pending', specialRequests
    });

    res.status(201).json({ success: true, booking, waitlisted: false });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const bookings = await Booking.find(query).populate('venue', 'name location images category pricePerHour').sort('-createdAt').skip(skip).limit(parseInt(limit));
    const total = await Booking.countDocuments(query);
    res.json({ success: true, bookings, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('venue').populate('user', 'firstName lastName email phone');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (['cancelled', 'completed'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel this booking' });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = req.body.reason;
    await booking.save();

    // Promote next waitlisted booking
    const next = await Booking.findOne({ venue: booking.venue, date: booking.date, status: 'waitlisted' }).sort('waitlistPosition');
    if (next) {
      next.status = 'confirmed';
      next.confirmedAt = new Date();
      next.waitlistPosition = undefined;
      await next.save();
    }

    // Notify first active Waitlist entry for same venue+date
    const waitlistEntry = await Waitlist.findOne({
      venue: booking.venue,
      requestedDate: booking.date,
      status: 'active'
    }).sort('position');
    if (waitlistEntry) {
      waitlistEntry.status = 'notified';
      waitlistEntry.notifiedAt = new Date();
      await waitlistEntry.save();
    }

    res.json({ success: true, booking, message: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOwnerBookings = async (req, res) => {
  try {
    const Venue = require('../models/Venue');
    const { status } = req.query;
    const venues = await Venue.find({ owner: req.user._id }).select('_id');
    const venueIds = venues.map(v => v._id);
    const query = { venue: { $in: venueIds } };
    if (status) query.status = status;
    const bookings = await Booking.find(query)
      .populate('venue', 'name location images category pricePerHour')
      .populate('user', 'firstName lastName email phone')
      .sort('-createdAt');
    res.json({ success: true, bookings, total: bookings.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('venue');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.venue.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (booking.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Cannot confirm a booking with status "${booking.status}"` });
    }

    booking.status = 'confirmed';
    booking.confirmedAt = new Date();
    await booking.save();

    res.json({ success: true, booking, message: 'Booking confirmed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('venue');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.venue.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (booking.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Cannot reject a booking with status "${booking.status}"` });
    }

    booking.status = 'rejected';
    booking.rejectedAt = new Date();
    booking.rejectionReason = req.body.reason || '';
    await booking.save();

    res.json({ success: true, booking, message: 'Booking rejected' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.requestEditBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('venue');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    if (!['pending', 'confirmed'].includes(booking.status))
      return res.status(400).json({ success: false, message: 'Can only edit pending or confirmed bookings' });
    if (booking.editRequest?.status === 'pending')
      return res.status(400).json({ success: false, message: 'An edit request is already pending owner review' });

    const { date, startTime, endTime, guestCount, specialRequests } = req.body;
    const newDate      = date      ? new Date(date) : booking.date;
    const newStart     = startTime || booking.startTime;
    const newEnd       = endTime   || booking.endTime;
    const newGuests    = guestCount != null ? parseInt(guestCount) : booking.guestCount;

    if (newGuests > booking.venue.capacity)
      return res.status(400).json({ success: false, message: `Venue capacity is ${booking.venue.capacity}` });

    const conflict = await Booking.findOne({
      venue: booking.venue._id,
      _id: { $ne: booking._id },
      date: newDate,
      status: 'confirmed',
      $or: [{ startTime: { $lt: newEnd }, endTime: { $gt: newStart } }]
    });
    if (conflict)
      return res.status(400).json({ success: false, message: 'Requested time slot is not available' });

    const totalHours = calcHours(newStart, newEnd);
    if (totalHours <= 0)
      return res.status(400).json({ success: false, message: 'End time must be after start time' });

    booking.editRequest = {
      status: 'pending',
      date: newDate,
      startTime: newStart,
      endTime: newEnd,
      guestCount: newGuests,
      specialRequests: specialRequests !== undefined ? specialRequests : booking.specialRequests,
      totalHours,
      totalPrice: totalHours * booking.venue.pricePerHour,
      requestedAt: new Date()
    };
    await booking.save();
    res.json({ success: true, booking, message: 'Edit request submitted — awaiting owner approval' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.reviewEditRequest = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('venue');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.venue.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });
    if (!booking.editRequest || booking.editRequest.status !== 'pending')
      return res.status(400).json({ success: false, message: 'No pending edit request on this booking' });

    const { action, ownerNote } = req.body;
    if (!['approve', 'reject'].includes(action))
      return res.status(400).json({ success: false, message: 'action must be "approve" or "reject"' });

    if (action === 'approve') {
      booking.date            = booking.editRequest.date;
      booking.startTime       = booking.editRequest.startTime;
      booking.endTime         = booking.editRequest.endTime;
      booking.guestCount      = booking.editRequest.guestCount;
      booking.specialRequests = booking.editRequest.specialRequests;
      booking.totalHours      = booking.editRequest.totalHours;
      booking.totalPrice      = booking.editRequest.totalPrice;
    }

    booking.editRequest.status     = action === 'approve' ? 'approved' : 'rejected';
    booking.editRequest.reviewedAt = new Date();
    booking.editRequest.ownerNote  = ownerNote || '';
    await booking.save();

    const msg = action === 'approve' ? 'Edit approved — booking updated' : 'Edit request rejected';
    res.json({ success: true, booking, message: msg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getVenueBookings = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.venueId);
    if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });
    if (venue.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const bookings = await Booking.find({ venue: req.params.venueId }).populate('user', 'firstName lastName email phone').sort('-date');
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
