const express = require('express');
const router  = express.Router();

const {
  getAllMachines,
  getAvailableMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
} = require('../controllers/machineController');

const { protect, protectCustomer } = require('../middleware/authMiddleware');
const { authorizeRoles }           = require('../middleware/roleMiddleware');

// Customer Portal — view available machines only
router.get('/available', protectCustomer, getAvailableMachines);

// Admin & Staff — view all machines (with optional ?status= filter)
router.get('/',    protect, authorizeRoles('admin', 'staff'), getAllMachines);
router.get('/:id', protect, authorizeRoles('admin', 'staff'), getMachineById);

// Admin only — full CRUD
router.post('/',    protect, authorizeRoles('admin'), createMachine);
router.put('/:id',  protect, authorizeRoles('admin'), updateMachine);
router.delete('/:id', protect, authorizeRoles('admin'), deleteMachine);

module.exports = router;
