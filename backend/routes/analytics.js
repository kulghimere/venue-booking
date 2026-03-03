const express = require('express');
const router = express.Router();
const { getDashboardStats, getBookingTrends, getCategoryStats, getPublicStats } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/public-stats', getPublicStats);          // no auth — used on landing page
router.get('/stats', protect, getDashboardStats);
router.get('/trends', protect, getBookingTrends);
router.get('/categories', getCategoryStats);

module.exports = router;
