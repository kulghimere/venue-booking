const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getBooking, cancelBooking, getVenueBookings } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/:id', protect, getBooking);
router.put('/:id/cancel', protect, cancelBooking);
router.get('/venue/:venueId', protect, authorize('venue_owner', 'admin'), getVenueBookings);

module.exports = router;
