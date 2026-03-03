const express = require('express');
const router = express.Router();
const { createReview, getVenueReviews, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/', getVenueReviews);
router.post('/', protect, createReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
