const express = require('express');
const router = express.Router();
const { getMyWaitlist, removeFromWaitlist, getVenueWaitlist } = require('../controllers/waitlistController');
const { protect, authorize } = require('../middleware/auth');

router.get('/my', protect, getMyWaitlist);
router.delete('/:id', protect, removeFromWaitlist);
router.get('/venue/:venueId', protect, authorize('venue_owner', 'admin'), getVenueWaitlist);

module.exports = router;
