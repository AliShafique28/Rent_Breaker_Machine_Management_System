const Rental = require('../models/Rental');
const Machine = require('../models/Machine');
const Customer = require('../models/Customer');

// helper: parse date range from query
const getDateRange = (query) => {
  let { startDate, endDate } = query;

  let start = startDate ? new Date(startDate) : null;
  let end = endDate ? new Date(endDate) : null;

  if (!start || !end) {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    start = start || first;
    end = end || last;
  }

  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// -------------------------------------------------------
// @desc    Daily / Monthly rental report
// @route   GET /api/reports/rentals?startDate=2026-03-01&endDate=2026-03-31
// @access  Admin, Staff
// -------------------------------------------------------
const getRentalReport = async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);

    const rentals = await Rental.find({
      createdAt: { $gte: start, $lte: end },
    })
      .populate('customer', 'name phone')
      .populate('machine', 'name capacity rentalPricePerDay')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      range: { start, end },
      count: rentals.length,
      data: rentals,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------
// @desc    Machine utilization report
// @route   GET /api/reports/machines/utilization?startDate=2026-03-01&endDate=2026-03-31
// @access  Admin, Staff
// -------------------------------------------------------
const getMachineUtilizationReport = async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);

    const rentals = await Rental.find({
      status: { $in: ['Active', 'Completed'] },
      startDate: { $lte: end },
      endDate: { $gte: start },
    }).populate('machine', 'name');

    const machines = await Machine.find().select('name');

    const utilizationMap = {};

    machines.forEach((m) => {
      utilizationMap[m._id.toString()] = {
        machineId: m._id,
        machineName: m.name,
        totalDaysRented: 0,
        totalRent: 0,
      };
    });

    rentals.forEach((r) => {
      if (!r.machine) return;
      const mid = r.machine._id.toString();

      const rentalStart = r.startDate < start ? start : r.startDate;
      const rentalEnd = r.endDate > end ? end : r.endDate;
      const diffTime = rentalEnd.getTime() - rentalStart.getTime();
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 0;

      if (utilizationMap[mid]) {
        utilizationMap[mid].totalDaysRented += days;
        utilizationMap[mid].totalRent += r.totalRent || 0;
      }
    });

    const result = Object.values(utilizationMap);

    res.status(200).json({
      success: true,
      range: { start, end },
      count: result.length,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------
// @desc    Revenue report (overall or by date range)
// @route   GET /api/reports/revenue?startDate=2026-03-01&endDate=2026-03-31
// @access  Admin, Staff
// -------------------------------------------------------
const getRevenueReport = async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);

    const rentals = await Rental.find({
      createdAt: { $gte: start, $lte: end },
      status: { $in: ['Active', 'Completed'] },
    });

    let totalRevenue = 0;
    let totalAdvance = 0;
    let totalRemaining = 0;

    rentals.forEach((r) => {
      totalRevenue += r.totalRent || 0;
      totalAdvance += r.advancePaid || 0;
      totalRemaining += r.remainingBalance || 0;
    });

    res.status(200).json({
      success: true,
      range: { start, end },
      totalRentals: rentals.length,
      totalRevenue,
      totalAdvance,
      totalRemaining,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------
// @desc    Customer rental history report
// @route   GET /api/reports/customers/:customerId/rentals
// @access  Admin, Staff
// -------------------------------------------------------
const getCustomerRentalHistoryReport = async (req, res) => {
  try {
    const customerId = req.params.customerId;

    const customer = await Customer.findById(customerId).select('name phone cnic');
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const rentals = await Rental.find({ customer: customerId })
      .populate('machine', 'name capacity rentalPricePerDay location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      customer,
      count: rentals.length,
      data: rentals,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getRentalReport,
  getMachineUtilizationReport,
  getRevenueReport,
  getCustomerRentalHistoryReport,
};
