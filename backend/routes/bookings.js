const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getOwnerBookings, getBooking, cancelBooking, getVenueBookings, confirmBooking, rejectBooking } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/owner', protect, authorize('venue_owner', 'admin'), getOwnerBookings);
router.get('/:id', protect, getBooking);
router.put('/:id/cancel', protect, cancelBooking);
router.put('/:id/confirm', protect, authorize('venue_owner', 'admin'), confirmBooking);
router.put('/:id/reject', protect, authorize('venue_owner', 'admin'), rejectBooking);
router.get('/venue/:venueId', protect, authorize('venue_owner', 'admin'), getVenueBookings);

module.exports = router;
