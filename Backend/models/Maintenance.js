const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
    machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
    date: { type: Date, required: true, default: Date.now },
    issue: { type: String, required: true },
    cost: { type: Number, required: true, default: 0 },
    nextMaintenanceDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
