const express = require('express');
const router = express.Router();
const { getDashboardStats, getBookingTrends, getCategoryStats } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, getDashboardStats);
router.get('/trends', protect, getBookingTrends);
router.get('/categories', getCategoryStats);

module.exports = router;
