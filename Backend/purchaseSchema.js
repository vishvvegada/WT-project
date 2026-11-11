const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  medicineName: { type: String, required: true },
  quantity: { type: Number, required: true },
  costPrice: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  supplier: { type: String, default: 'General Supplier' }
}, { timestamps: true });

module.exports = mongoose.model('Purchase', purchaseSchema);
