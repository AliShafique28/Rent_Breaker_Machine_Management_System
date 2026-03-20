const express = require('express');
const router = express.Router();
const {
  loginUser,
  createStaff,
  registerCustomer,
  loginCustomer,
  getStaffMembers,
  deleteStaff,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.post('/login', loginUser);
router.post('/create-staff', protect, authorizeRoles('admin'), createStaff);
router.post('/customer/register', registerCustomer);
router.post('/customer/login', loginCustomer);
router.get('/staff', protect, authorizeRoles('admin'), getStaffMembers);
router.delete('/staff/:id', protect, authorizeRoles('admin'), deleteStaff);

module.exports = router;
