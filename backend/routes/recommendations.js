const express = require('express');
const router = express.Router();
const { getRecommendations, getSimilarVenues } = require('../controllers/recommendationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getRecommendations);
router.get('/similar/:id', getSimilarVenues);

module.exports = router;
