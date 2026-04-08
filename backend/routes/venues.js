const express = require('express');
const router = express.Router();
const { getVenues, getVenue, createVenue, updateVenue, deleteVenue, getVenueAvailability, getMyVenues } = require('../controllers/venueController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getVenues);
router.get('/my-venues', protect, authorize('venue_owner', 'admin'), getMyVenues);
router.get('/:id', getVenue);
router.get('/:id/availability', getVenueAvailability);
router.post('/', protect, authorize('venue_owner', 'admin'), createVenue);
router.put('/:id', protect, authorize('venue_owner', 'admin'), updateVenue);
router.delete('/:id', protect, authorize('venue_owner', 'admin'), deleteVenue);

module.exports = router;
