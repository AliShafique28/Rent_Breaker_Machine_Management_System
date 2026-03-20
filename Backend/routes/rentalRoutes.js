const express = require('express');
const router = express.Router();

const {
    getAllRentals,
    getRentalById,
    createRentalByStaff,
    requestRentalByCustomer,
    updateRental,
    getMyRentals,
    getRentalBilling,
    updateRentalPayment,
    getBillingSummary,
} = require('../controllers/rentalController');

const { protect, protectCustomer } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Admin & Staff
router.get('/', protect, authorizeRoles('admin', 'staff'), getAllRentals);
router.get('/:id', protect, authorizeRoles('admin', 'staff'), getRentalById);
router.post('/', protect, authorizeRoles('admin', 'staff'), createRentalByStaff);
router.put('/:id', protect, authorizeRoles('admin', 'staff'), updateRental);

router.get('/:id/billing', protect, authorizeRoles('admin', 'staff'), getRentalBilling);
router.put('/:id/payment', protect, authorizeRoles('admin', 'staff'), updateRentalPayment);
router.get('/billing/summary', protect, authorizeRoles('admin', 'staff'), getBillingSummary);

// Customer
router.post('/request', protectCustomer, requestRentalByCustomer);
router.get('/my/list', protectCustomer, getMyRentals);

module.exports = router;
