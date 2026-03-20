const User = require('../models/User');
const Customer = require('../models/Customer');
const generateToken = require('../utils/generateToken');

// @desc    Login Admin or Staff
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Please provide email and password' });

  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: 'Invalid email or password' });

  res.json({
    _id:   user._id,
    name:  user.name,
    email: user.email,
    role:  user.role,
    token: generateToken(user._id),
  });
};

// @desc    Admin creates a new Staff account
// @route   POST /api/auth/create-staff
// @access  Admin only
const createStaff = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: 'Please provide name, email, and password' });

  const exists = await User.findOne({ email });
  if (exists)
    return res.status(400).json({ message: 'A user with this email already exists' });

  const staff = await User.create({ name, email, password, role: 'staff' });

  res.status(201).json({
    _id:     staff._id,
    name:    staff.name,
    email:   staff.email,
    role:    staff.role,
    message: 'Staff account created successfully',
  });
};

// @desc    Customer Register
// @route   POST /api/auth/customer/register
// @access  Public
const registerCustomer = async (req, res) => {
  const { name, email, password, phone, cnic, address } = req.body;

  if (!name || !email || !password || !phone || !cnic || !address)
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });

  // Phone: exactly 11 digits
  const phoneRegex = /^\d{11}$/;
  if (!phoneRegex.test(phone))
    return res.status(400).json({ success: false, message: 'Phone number must be exactly 11 digits' });

  // CNIC: exactly 13 digits (digits only, no dashes)
  const cnicDigits = cnic.replace(/-/g, '');
  if (!/^\d{13}$/.test(cnicDigits))
    return res.status(400).json({ success: false, message: 'CNIC must contain exactly 13 digits' });

  const exists = await Customer.findOne({ $or: [{ email }, { cnic }] });
  if (exists)
    return res.status(400).json({ success: false, message: 'Customer with this email or CNIC already exists' });

  const customer = await Customer.create({ name, email, password, phone, cnic, address });

  res.status(201).json({
    _id:     customer._id,
    name:    customer.name,
    email:   customer.email,
    phone:   customer.phone,
    cnic:    customer.cnic,
    address: customer.address,
    token:   generateToken(customer._id),
  });
};


// @desc    Customer Login
// @route   POST /api/auth/customer/login
// @access  Public
const loginCustomer = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Please provide email and password' });

  const customer = await Customer.findOne({ email });

  if (!customer || !(await customer.matchPassword(password)))
    return res.status(401).json({ message: 'Invalid email or password' });

  res.json({
    _id:   customer._id,
    name:  customer.name,
    email: customer.email,
    phone: customer.phone,
    token: generateToken(customer._id),
  });
};

// @desc    Get all staff members
// @route   GET /api/auth/staff
// @access  Admin only
const getStaffMembers = async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff' }).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: staff.length, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a staff member
// @route   DELETE /api/auth/staff/:id
// @access  Admin only
const deleteStaff = async (req, res) => {
  try {
    const staff = await User.findOne({ _id: req.params.id, role: 'staff' });
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }
    
    await staff.deleteOne();
    res.status(200).json({ success: true, message: 'Staff member deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update module.exports at the very bottom
module.exports = { 
  loginUser, 
  createStaff, 
  registerCustomer, 
  loginCustomer,
  getStaffMembers, // <-- add this
  deleteStaff      // <-- add this
};

