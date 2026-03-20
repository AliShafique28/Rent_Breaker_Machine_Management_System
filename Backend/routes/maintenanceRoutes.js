const express = require('express');
const router = express.Router();

const {
    getAllMaintenance,
    getMaintenanceById,
    createMaintenance,
    updateMaintenance,
    deleteMaintenance,
} = require('../controllers/maintenanceController');

const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Admin & Staff
router.get('/', protect, authorizeRoles('admin', 'staff'), getAllMaintenance);
router.get('/:id', protect, authorizeRoles('admin', 'staff'), getMaintenanceById);
router.post('/', protect, authorizeRoles('admin', 'staff'), createMaintenance);
router.put('/:id', protect, authorizeRoles('admin', 'staff'), updateMaintenance);

// Admin only
router.delete('/:id', protect, authorizeRoles('admin'), deleteMaintenance);

module.exports = router;
