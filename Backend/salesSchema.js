const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema({
  sellingPrice: { type: Number, required: true },
  costPrice: { type: Number, required: true },
});

module.exports = mongoose.model('Sales', salesSchema);
