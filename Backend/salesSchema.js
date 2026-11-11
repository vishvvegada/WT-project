const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema({
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  medicineName: { type: String, required: true },
  quantity: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  costPrice: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  customerName: { type: String, default: 'Walk-in Customer' }
}, { timestamps: true });

module.exports = mongoose.model('Sales', salesSchema);
