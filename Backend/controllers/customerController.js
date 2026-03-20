const Customer = require('../models/Customer');
const Rental = require('../models/Rental');

// -------------------------------------------------------
// @desc    Get all customers
// @route   GET /api/customers
// @access  Admin, Staff
// -------------------------------------------------------
const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------
// @desc    Get single customer by ID
// @route   GET /api/customers/:id
// @access  Admin, Staff
// -------------------------------------------------------
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select('-password');

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------
// @desc    Get customer rental history
// @route   GET /api/customers/:id/rentals
// @access  Admin, Staff
// -------------------------------------------------------
const getCustomerRentalHistory = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select('-password');

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const rentals = await Rental.find({ customer: req.params.id })
      .populate('machine', 'name capacity rentalPricePerDay location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      customer: customer.name,
      count: rentals.length,
      data: rentals,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------
// @desc    Update customer by Admin/Staff
// @route   PUT /api/customers/:id
// @access  Admin, Staff
// -------------------------------------------------------
const updateCustomerByAdmin = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer)
      return res.status(404).json({ success: false, message: 'Customer not found' });

    if (req.body.password)
      return res.status(400).json({ success: false, message: 'Password cannot be updated from this route' });

    // Phone validation
    if (req.body.phone) {
      const phoneRegex = /^\d{11}$/;
      if (!phoneRegex.test(req.body.phone))
        return res.status(400).json({ success: false, message: 'Phone number must be exactly 11 digits' });
    }

    // CNIC validation
    if (req.body.cnic) {
      const cnicDigits = req.body.cnic.replace(/-/g, '');
      if (!/^\d{13}$/.test(cnicDigits))
        return res.status(400).json({ success: false, message: 'CNIC must contain exactly 13 digits' });
    }

    if (req.body.cnic && req.body.cnic !== customer.cnic) {
      const cnicExists = await Customer.findOne({ cnic: req.body.cnic });
      if (cnicExists)
        return res.status(400).json({ success: false, message: 'Another customer with this CNIC already exists' });
    }

    if (req.body.email && req.body.email !== customer.email) {
      const emailExists = await Customer.findOne({ email: req.body.email });
      if (emailExists)
        return res.status(400).json({ success: false, message: 'Another customer with this email already exists' });
    }

    const updated = await Customer.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data:    updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// -------------------------------------------------------
// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Admin only
// -------------------------------------------------------
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Professional check — cannot delete customer with active/pending rentals
    const linkedRental = await Rental.findOne({
      customer: req.params.id,
      status: { $in: ['Pending', 'Active'] },
    });

    if (linkedRental) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete — customer has a ${linkedRental.status} rental. Resolve it first.`,
      });
    }

    await customer.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------
// @desc    Get logged-in customer own profile
// @route   GET /api/customers/profile/me
// @access  Customer
// -------------------------------------------------------
const getMyProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer._id).select('-password');

    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------
// @desc    Customer updates own profile
// @route   PUT /api/customers/profile/me
// @access  Customer
// -------------------------------------------------------
const updateMyProfile = async (req, res) => {
  try {
    if (req.body.password) {
      return res.status(400).json({
        success: false,
        message: 'Password cannot be updated from this route',
      });
    }

    // Phone validation
    if (req.body.phone) {
      const phoneRegex = /^\d{11}$/;
      if (!phoneRegex.test(req.body.phone))
        return res.status(400).json({ success: false, message: 'Phone number must be exactly 11 digits' });
    }

    // CNIC validation
    if (req.body.cnic) {
      const cnicDigits = req.body.cnic.replace(/-/g, '');
      if (!/^\d{13}$/.test(cnicDigits))
        return res.status(400).json({ success: false, message: 'CNIC must contain exactly 13 digits' });
    }

    if (req.body.cnic && req.body.cnic !== req.customer.cnic) {
      const cnicExists = await Customer.findOne({ cnic: req.body.cnic });
      if (cnicExists)
        return res.status(400).json({ success: false, message: 'Another customer with this CNIC already exists' });
    }

    if (req.body.email && req.body.email !== req.customer.email) {
      const emailExists = await Customer.findOne({ email: req.body.email });
      if (emailExists)
        return res.status(400).json({ success: false, message: 'Another customer with this email already exists' });
    }

    const updated = await Customer.findByIdAndUpdate(
      req.customer._id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// -------------------------------------------------------
// @desc    Get logged-in customer own rental history
// @route   GET /api/customers/profile/my-rentals
// @access  Customer
// -------------------------------------------------------
const getMyRentals = async (req, res) => {
  try {
    const rentals = await Rental.find({ customer: req.customer._id })
      .populate('machine', 'name capacity rentalPricePerDay location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rentals.length,
      data: rentals,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  getCustomerRentalHistory,
  updateCustomerByAdmin,
  deleteCustomer,
  getMyProfile,
  updateMyProfile,
  getMyRentals,
};
