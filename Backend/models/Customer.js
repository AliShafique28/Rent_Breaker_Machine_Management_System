const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const customerSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone:    { type: String, required: true },
  cnic:     { type: String, required: true, unique: true },
  address:  { type: String, required: true },
}, { timestamps: true });

customerSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

customerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// -------------------------------------------------------
// PRE DELETE HOOK
// Jab bhi koi customer delete ho, uski saari rentals bhi
// delete ho jayen. Agar koi rental Active thi to machine
// bhi wapas Available ho jaye.
// -------------------------------------------------------
customerSchema.pre('deleteOne', { document: true, query: false }, async function () {
  try {
    const Rental  = mongoose.model('Rental');
    const Machine = mongoose.model('Machine');

    // Find all rentals of this customer
    const rentals = await Rental.find({ customer: this._id });

    // If any rental was Active, set its machine back to Available
    for (const rental of rentals) {
      if (rental.status === 'Active') {
        await Machine.findByIdAndUpdate(rental.machine, { status: 'Available' });
      }
    }

    // Delete all rentals of this customer
    await Rental.deleteMany({ customer: this._id });

  
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Customer', customerSchema);
