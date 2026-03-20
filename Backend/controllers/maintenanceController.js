const Maintenance = require('../models/Maintenance');
const Machine     = require('../models/Machine');

// -------------------------------------------------------
// @desc    Get all maintenance records (optional filter by machine)
// @route   GET /api/maintenance
// @access  Admin, Staff
// -------------------------------------------------------
const getAllMaintenance = async (req, res) => {
  try {
    const filter = {};

    if (req.query.machineId) {
      filter.machine = req.query.machineId;
    }

    const records = await Maintenance.find(filter)
      .populate('machine', 'name capacity rentalPricePerDay location status')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------
// @desc    Get single maintenance record by ID
// @route   GET /api/maintenance/:id
// @access  Admin, Staff
// -------------------------------------------------------
const getMaintenanceById = async (req, res) => {
  try {
    const record = await Maintenance.findById(req.params.id)
      .populate('machine', 'name capacity rentalPricePerDay location status');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    }

    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------
// @desc    Create a maintenance record
// @route   POST /api/maintenance
// @access  Admin, Staff
// -------------------------------------------------------
const createMaintenance = async (req, res) => {
  try {
    const { machineId, date, issue, cost, nextMaintenanceDate } = req.body;

    if (!machineId || !issue || typeof cost !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'machineId, issue and numeric cost are required',
      });
    }

    if (cost < 0) {
      return res.status(400).json({
        success: false,
        message: 'Cost cannot be negative',
      });
    }

    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res.status(404).json({ success: false, message: 'Machine not found' });
    }

    const record = await Maintenance.create({
      machine: machineId,
      date: date || new Date(),
      issue,
      cost,
      nextMaintenanceDate: nextMaintenanceDate || null,
    });

    // Optional: when in maintenance, set machine status to "Maintenance"
    if (machine.status !== 'Maintenance') {
      machine.status = 'Maintenance';
      await machine.save();
    }

    const populated = await Maintenance.findById(record._id)
      .populate('machine', 'name capacity rentalPricePerDay location status');

    res.status(201).json({
      success: true,
      message: 'Maintenance record created successfully',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------
// @desc    Update a maintenance record
// @route   PUT /api/maintenance/:id
// @access  Admin, Staff
// -------------------------------------------------------
const updateMaintenance = async (req, res) => {
  try {
    const record = await Maintenance.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    }

    const { date, issue, cost, nextMaintenanceDate } = req.body;

    if (typeof cost === 'number' && cost < 0) {
      return res.status(400).json({
        success: false,
        message: 'Cost cannot be negative',
      });
    }

    if (date) record.date = date;
    if (issue) record.issue = issue;
    if (typeof cost === 'number') record.cost = cost;
    if (nextMaintenanceDate !== undefined) {
      record.nextMaintenanceDate = nextMaintenanceDate || null;
    }

    await record.save();

    const populated = await Maintenance.findById(record._id)
      .populate('machine', 'name capacity rentalPricePerDay location status');

    res.status(200).json({
      success: true,
      message: 'Maintenance record updated successfully',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------
// @desc    Delete a maintenance record
// @route   DELETE /api/maintenance/:id
// @access  Admin only
// -------------------------------------------------------
const deleteMaintenance = async (req, res) => {
  try {
    const record = await Maintenance.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    }

    await record.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Maintenance record deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllMaintenance,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
};