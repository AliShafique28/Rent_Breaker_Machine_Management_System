const express = require('express');
const router = express.Router();

const {
    getAllCustomers,
    getCustomerById,
    getCustomerRentalHistory,
    updateCustomerByAdmin,
    deleteCustomer,
    getMyProfile,
    updateMyProfile,
    getMyRentals,
} = require('../controllers/customerController');

const { protect, protectCustomer } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// ── Customer Portal (self) ──────────────────────────────
router.get('/profile/me', protectCustomer, getMyProfile);
router.put('/profile/me', protectCustomer, updateMyProfile);
router.get('/profile/my-rentals', protectCustomer, getMyRentals);

// ── Admin & Staff ───────────────────────────────────────
router.get('/', protect, authorizeRoles('admin', 'staff'), getAllCustomers);
router.get('/:id', protect, authorizeRoles('admin', 'staff'), getCustomerById);
router.get('/:id/rentals', protect, authorizeRoles('admin', 'staff'), getCustomerRentalHistory);
router.put('/:id', protect, authorizeRoles('admin', 'staff'), updateCustomerByAdmin);

// ── Admin only ──────────────────────────────────────────
router.delete('/:id', protect, authorizeRoles('admin'), deleteCustomer);

module.exports = router;
