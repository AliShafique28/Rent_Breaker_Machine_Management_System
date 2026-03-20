const express = require('express');
const router = express.Router();

const {
    getRentalReport,
    getMachineUtilizationReport,
    getRevenueReport,
    getCustomerRentalHistoryReport,
} = require('../controllers/reportController');

const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// All reports are Admin/Staff only
router.get('/rentals', protect, authorizeRoles('admin', 'staff'), getRentalReport);
router.get('/machines/utilization', protect, authorizeRoles('admin', 'staff'), getMachineUtilizationReport);
router.get('/revenue', protect, authorizeRoles('admin', 'staff'), getRevenueReport);
router.get('/customers/:customerId/rentals',
    protect,
    authorizeRoles('admin', 'staff'),
    getCustomerRentalHistoryReport
);

module.exports = router;
