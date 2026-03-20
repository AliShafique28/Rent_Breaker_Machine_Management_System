const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema({
  name:               { type: String, required: true, trim: true },
  capacity:           { type: String, required: true },
  rentalPricePerDay:  { type: Number, required: true },
  status:             { type: String, enum: ['Available', 'Rented', 'Maintenance'], default: 'Available' },
  location:           { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Machine', machineSchema);
