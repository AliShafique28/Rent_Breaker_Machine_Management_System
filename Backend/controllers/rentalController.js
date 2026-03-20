const Rental = require('../models/Rental');
const Machine = require('../models/Machine');

// helper: calculate days (min 1)
const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return days <= 0 ? 1 : days;
};

// helper: recalc billing
const calculateBilling = (machinePricePerDay, startDate, endDate, advancePaid = 0) => {
  const days = calculateDays(startDate, endDate);
  const totalRent = machinePricePerDay * days;
  const remainingBalance = totalRent - (advancePaid || 0);
  let paymentStatus = 'Unpaid';
  if (remainingBalance <= 0 && totalRent > 0) paymentStatus = 'Paid';
  else if (advancePaid > 0 && remainingBalance > 0) paymentStatus = 'Partial';

  return { days, totalRent, remainingBalance, paymentStatus };
};

// -------------------------------------------------------
// @desc    Get all rentals (optional filters: status, customer, machine)
// @route   GET /api/rentals
// @access  Admin, Staff
// -------------------------------------------------------
const getAllRentals = async (req, res) => {
  try {
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.customerId) {
      filter.customer = req.query.customerId;
    }

    if (req.query.machineId) {
      filter.machine = req.query.machineId;
    }

    const rentals = await Rental.find(filter)
      .populate('customer', 'name phone cnic')
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

// -------------------------------------------------------
// @desc    Get rental by ID
// @route   GET /api/rentals/:id
// @access  Admin, Staff
// -------------------------------------------------------
const getRentalById = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate('customer', 'name phone cnic address')
      .populate('machine', 'name capacity rentalPricePerDay location');

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    res.status(200).json({ success: true, data: rental });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------
// @desc    Admin/Staff creates rental directly (Pending or Active)
// @route   POST /api/rentals
// @access  Admin, Staff
// -------------------------------------------------------
const createRentalByStaff = async (req, res) => {
  try {
    const {
      machineId,
      customerId,
      startDate,
      endDate,
      status,        // Pending or Active
      advancePaid,
      notes,
    } = req.body;

    if (!machineId || !customerId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'machineId, customerId, startDate, and endDate are required',
      });
    }

    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res.status(404).json({ success: false, message: 'Machine not found' });
    }

    if (!['Pending', 'Active'].includes(status || 'Pending')) {
      return res.status(400).json({
        success: false,
        message: 'Status must be Pending or Active when creating a rental',
      });
    }

    // if creating Active rental, machine must be Available
    if ((status || 'Pending') === 'Active' && machine.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: 'Machine is not available for Active rental',
      });
    }

    const { totalRent, remainingBalance, paymentStatus } = calculateBilling(
      machine.rentalPricePerDay,
      startDate,
      endDate,
      advancePaid || 0
    );

    const rental = await Rental.create({
      machine: machineId,
      customer: customerId,
      startDate,
      endDate,
      totalRent,
      advancePaid: advancePaid || 0,
      remainingBalance,
      paymentStatus,
      status: status || 'Pending',
      notes,
    });

    // if Active, set machine to Rented
    if (rental.status === 'Active') {
      machine.status = 'Rented';
      await machine.save();
    }

    const populated = await Rental.findById(rental._id)
      .populate('customer', 'name phone cnic')
      .populate('machine', 'name capacity rentalPricePerDay location');

    res.status(201).json({
      success: true,
      message: 'Rental created successfully',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------
// @desc    Customer requests rental (always Pending, machine stays Available)
// @route   POST /api/rentals/request
// @access  Customer
// -------------------------------------------------------
const requestRentalByCustomer = async (req, res) => {
  try {
    const { machineId, startDate, endDate, notes } = req.body;

    if (!machineId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'machineId, startDate, and endDate are required',
      });
    }

    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res.status(404).json({ success: false, message: 'Machine not found' });
    }

    // Customer request does NOT change machine status yet
    const { totalRent, remainingBalance, paymentStatus } = calculateBilling(
      machine.rentalPricePerDay,
      startDate,
      endDate,
      0
    );

    const rental = await Rental.create({
      machine: machineId,
      customer: req.customer._id,
      startDate,
      endDate,
      totalRent,
      advancePaid: 0,
      remainingBalance,
      paymentStatus,
      status: 'Pending',
      notes,
    });

    const populated = await Rental.findById(rental._id)
      .populate('machine', 'name capacity rentalPricePerDay location');

    res.status(201).json({
      success: true,
      message: 'Rental request submitted successfully',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------
// @desc    Staff/Admin updates rental status OR billing
// @route   PUT /api/rentals/:id
// @access  Admin, Staff
// -------------------------------------------------------
const updateRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    const machine = await Machine.findById(rental.machine);
    if (!machine) {
      return res.status(404).json({ success: false, message: 'Machine not found' });
    }

    const { status, startDate, endDate, advancePaid, notes } = req.body;

    // Update core fields if provided
    if (startDate) rental.startDate = startDate;
    if (endDate) rental.endDate = endDate;
    if (typeof advancePaid === 'number') rental.advancePaid = advancePaid;
    if (typeof notes === 'string') rental.notes = notes;

    // Handle status transitions
    if (status) {
      if (!['Pending', 'Active', 'Completed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Allowed: Pending, Active, Completed',
        });
      }

      // PENDING -> ACTIVE
      if (rental.status === 'Pending' && status === 'Active') {
        if (machine.status !== 'Available') {
          return res.status(400).json({
            success: false,
            message: 'Machine is not available to activate this rental',
          });
        }
        machine.status = 'Rented';
        rental.status = 'Active';
      }

      // ACTIVE -> COMPLETED
      else if (rental.status === 'Active' && status === 'Completed') {
        rental.status = 'Completed';
        machine.status = 'Available';
      }

      // PENDING -> COMPLETED (allowed only if you want to instantly close)
      else if (rental.status === 'Pending' && status === 'Completed') {
        rental.status = 'Completed';
        // Machine status remains as-is (most likely Available)
      }

      // No backward transitions like Completed -> Active etc.
      else if (rental.status === 'Completed') {
        return res.status(400).json({
          success: false,
          message: 'Completed rentals cannot be changed',
        });
      }
    }

    // Recalculate billing based on final dates & advance
    const { totalRent, remainingBalance, paymentStatus } = calculateBilling(
      machine.rentalPricePerDay,
      rental.startDate,
      rental.endDate,
      rental.advancePaid || 0
    );
    rental.totalRent = totalRent;
    rental.remainingBalance = remainingBalance;
    rental.paymentStatus = paymentStatus;

    await rental.save();
    await machine.save();

    const populated = await Rental.findById(rental._id)
      .populate('customer', 'name phone cnic')
      .populate('machine', 'name capacity rentalPricePerDay location');

    res.status(200).json({
      success: true,
      message: 'Rental updated successfully',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------
// @desc    Get rentals of logged-in customer
// @route   GET /api/rentals/my
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

// -------------------------------------------------------
// @desc    Get billing summary for a single rental
// @route   GET /api/rentals/:id/billing
// @access  Admin, Staff
// -------------------------------------------------------
const getRentalBilling = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate('customer', 'name phone cnic')
      .populate('machine', 'name capacity rentalPricePerDay location');

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    const billing = {
      customerName: rental.customer?.name,
      customerPhone: rental.customer?.phone,
      machineName: rental.machine?.name,
      machineCapacity: rental.machine?.capacity,
      rentalPeriod: {
        startDate: rental.startDate,
        endDate: rental.endDate,
      },
      totalRent: rental.totalRent,
      advancePaid: rental.advancePaid,
      remainingBalance: rental.remainingBalance,
      paymentStatus: rental.paymentStatus,
      rentalStatus: rental.status,
    };

    res.status(200).json({
      success: true,
      data: billing,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------
// @desc    Record / update payment for a rental
// @route   PUT /api/rentals/:id/payment
// @access  Admin, Staff
// -------------------------------------------------------
const updateRentalPayment = async (req, res) => {
  try {
    const { amount } = req.body;

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment amount is required',
      });
    }

    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    // Recalculate remaining & status (reuse same logic we used before)
    const machine = await Machine.findById(rental.machine);
    if (!machine) {
      return res.status(404).json({ success: false, message: 'Machine not found' });
    }

    // Recalculate current billing BEFORE adding new amount
    const currentBilling = calculateBilling(
      machine.rentalPricePerDay,
      rental.startDate,
      rental.endDate,
      rental.advancePaid || 0
    );

    // Prevent paying more than remaining
    if (amount > currentBilling.remainingBalance) {
      return res.status(400).json({
        success: false,
        message: `Payment exceeds remaining balance. Remaining: ${currentBilling.remainingBalance}`,
      });
    }

    // Safe to apply payment
    rental.advancePaid = (rental.advancePaid || 0) + amount;

    const { totalRent, remainingBalance, paymentStatus } = calculateBilling(
      machine.rentalPricePerDay,
      rental.startDate,
      rental.endDate,
      rental.advancePaid
    );

    rental.totalRent = totalRent;
    rental.remainingBalance = remainingBalance;
    rental.paymentStatus = paymentStatus;

    await rental.save();

    const populated = await Rental.findById(rental._id)
      .populate('customer', 'name phone cnic')
      .populate('machine', 'name capacity rentalPricePerDay location');

    res.status(200).json({
      success: true,
      message: 'Payment recorded successfully',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------
// @desc    Get aggregated billing summary (for dashboard)
// @route   GET /api/rentals/billing/summary
// @access  Admin, Staff
// -------------------------------------------------------
const getBillingSummary = async (req, res) => {
  try {
    const match = {};

    if (req.query.status) {
      match.status = req.query.status; // e.g. Completed
    }

    const rentals = await Rental.find(match);

    let totalRevenue = 0;
    let totalAdvance = 0;
    let totalRemaining = 0;

    rentals.forEach((r) => {
      totalRevenue += r.totalRent || 0;
      totalAdvance += r.advancePaid || 0;
      totalRemaining += r.remainingBalance || 0;
    });

    const summary = {
      totalRentals: rentals.length,
      totalRevenue,
      totalAdvance,
      totalRemaining,
    };

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllRentals,
  getRentalById,
  createRentalByStaff,
  requestRentalByCustomer,
  updateRental,
  getMyRentals,
  getRentalBilling,
  updateRentalPayment,
  getBillingSummary,
};

