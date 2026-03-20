const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
    machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalRent: { type: Number, default: 0 },         // auto-calculated
    advancePaid: { type: Number, default: 0 },
    remainingBalance: { type: Number, default: 0 },         // auto-calculated
    paymentStatus: { type: String, enum: ['Paid', 'Partial', 'Unpaid'], default: 'Unpaid' },
    status: { type: String, enum: ['Pending', 'Active', 'Completed'], default: 'Pending' },
    notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Rental', rentalSchema);
