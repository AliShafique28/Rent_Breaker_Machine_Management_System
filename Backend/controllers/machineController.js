const Machine = require('../models/Machine');
const Rental  = require('../models/Rental');

// -------------------------------------------------------
// @desc    Get all machines (with optional status filter)
// @route   GET /api/machines?status=Available
// @access  Admin, Staff
// -------------------------------------------------------
const getAllMachines = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const machines = await Machine.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count:   machines.length,
      data:    machines,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------
// @desc    Get available machines (Customer Portal)
// @route   GET /api/machines/available
// @access  Customer
// -------------------------------------------------------
const getAvailableMachines = async (req, res) => {
  try {
    const machines = await Machine.find({ status: 'Available' }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count:   machines.length,
      data:    machines,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------
// @desc    Get single machine by ID
// @route   GET /api/machines/:id
// @access  Admin, Staff
// -------------------------------------------------------
const getMachineById = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);

    if (!machine) {
      return res.status(404).json({ success: false, message: 'Machine not found' });
    }

    res.status(200).json({ success: true, data: machine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------
// @desc    Add new machine
// @route   POST /api/machines
// @access  Admin only
// -------------------------------------------------------
const createMachine = async (req, res) => {
  try {
    const { name, capacity, rentalPricePerDay, location, status } = req.body;

    // Validate required fields
    if (!name || !capacity || !rentalPricePerDay || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, capacity, rentalPricePerDay, and location',
      });
    }

    // Validate price is positive
    if (rentalPricePerDay <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Rental price per day must be greater than 0',
      });
    }

    const machine = await Machine.create({
      name,
      capacity,
      rentalPricePerDay,
      location,
      status: status || 'Available',
    });

    res.status(201).json({
      success: true,
      message: 'Machine added successfully',
      data:    machine,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------
// @desc    Update machine details
// @route   PUT /api/machines/:id
// @access  Admin only
// -------------------------------------------------------
const updateMachine = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);

    if (!machine) {
      return res.status(404).json({ success: false, message: 'Machine not found' });
    }

    // If changing status to Available, make sure no active rental exists
    if (req.body.status === 'Available') {
      const activeRental = await Rental.findOne({
        machine: req.params.id,
        status:  'Active',
      });

      if (activeRental) {
        return res.status(400).json({
          success: false,
          message: 'Cannot set status to Available — machine has an active rental',
        });
      }
    }

    const updated = await Machine.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Machine updated successfully',
      data:    updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------------------------------------------
// @desc    Delete machine
// @route   DELETE /api/machines/:id
// @access  Admin only
// -------------------------------------------------------
const deleteMachine = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);

    if (!machine) {
      return res.status(404).json({ success: false, message: 'Machine not found' });
    }

    // Professional check — cannot delete a machine with active or pending rentals
    const linkedRental = await Rental.findOne({
      machine: req.params.id,
      status:  { $in: ['Pending', 'Active'] },
    });

    if (linkedRental) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete — machine has a ${linkedRental.status} rental attached to it`,
      });
    }

    await machine.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Machine deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllMachines,
  getAvailableMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
};
