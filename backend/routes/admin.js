const express = require('express');
const router = express.Router();
const {
  getAllUsers, updateUserRole, deleteUser,
  getAllBookings, getAllVenues, toggleVenueActive,
  getRevenueReport, getTopVenues
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

router.get('/bookings', getAllBookings);

router.get('/venues', getAllVenues);
router.patch('/venues/:id/toggle', toggleVenueActive);

router.get('/reports/revenue', getRevenueReport);
router.get('/reports/top-venues', getTopVenues);

module.exports = router;
