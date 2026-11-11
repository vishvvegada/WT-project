const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Medicine = require('./medicineSchema');
const Sales = require('./salesSchema');
const Purchase = require('./purchaseSchema');

const app = express();

// Enable CORS for frontend connection (Vite runs on port 5173/5174, etc.)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connecting to MongoDB
const mongoURI = 'mongodb+srv://Vishvvegada53:vishv5306@cluster0.985sd.mongodb.net/shop';
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// ==========================================
// 1. MEDICINES (INVENTORY) API ENDPOINTS
// ==========================================

// GET all medicines
app.get('/api/medicines', async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ name: 1 });
    res.json(medicines);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching medicines' });
  }
});

// POST add new medicine
app.post('/api/medicines', async (req, res) => {
  const { name, category, stock, costPrice, sellingPrice, expiryDate, lowStockThreshold } = req.body;
  try {
    const newMedicine = new Medicine({
      name,
      category,
      stock: Number(stock) || 0,
      costPrice: Number(costPrice),
      sellingPrice: Number(sellingPrice),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      lowStockThreshold: Number(lowStockThreshold) || 10
    });

    await newMedicine.save();
    res.status(201).json(newMedicine);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Medicine with this name already exists' });
    }
    res.status(500).json({ error: 'Error adding medicine' });
  }
});

// PUT update medicine
app.put('/api/medicines/:id', async (req, res) => {
  const { name, category, stock, costPrice, sellingPrice, expiryDate, lowStockThreshold } = req.body;
  try {
    const updated = await Medicine.findByIdAndUpdate(
      req.params.id,
      {
        name,
        category,
        stock: Number(stock),
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        lowStockThreshold: Number(lowStockThreshold)
      },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Medicine not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating medicine' });
  }
});

// DELETE medicine
app.delete('/api/medicines/:id', async (req, res) => {
  try {
    const deleted = await Medicine.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Medicine not found' });
    res.json({ message: 'Medicine deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting medicine' });
  }
});

// ==========================================
// 2. PURCHASES API ENDPOINTS
// ==========================================

// GET all purchases
app.get('/api/purchases', async (req, res) => {
  try {
    const purchases = await Purchase.find().sort({ date: -1 });
    res.json(purchases);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching purchases' });
  }
});

// POST record new purchase
app.post('/api/purchases', async (req, res) => {
  const { medicineId, quantity, costPrice, supplier, date } = req.body;
  try {
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) return res.status(404).json({ error: 'Medicine not found' });

    const qty = Number(quantity);
    const cp = Number(costPrice) || medicine.costPrice;

    // Create purchase record
    const newPurchase = new Purchase({
      medicineId: medicine._id,
      medicineName: medicine.name,
      quantity: qty,
      costPrice: cp,
      supplier: supplier || 'General Supplier',
      date: date ? new Date(date) : new Date()
    });

    await newPurchase.save();

    // Increment medicine stock
    medicine.stock += qty;
    // Optionally update medicine cost price to match latest purchase
    medicine.costPrice = cp;
    await medicine.save();

    res.status(201).json(newPurchase);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error recording purchase' });
  }
});

// ==========================================
// 3. SALES API ENDPOINTS
// ==========================================

// GET all sales
app.get('/api/sales', async (req, res) => {
  try {
    const sales = await Sales.find().sort({ date: -1 });
    res.json(sales);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching sales' });
  }
});

// POST record new sale
app.post('/api/sales', async (req, res) => {
  const { medicineId, quantity, sellingPrice, customerName, date } = req.body;
  try {
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) return res.status(404).json({ error: 'Medicine not found' });

    const qty = Number(quantity);
    if (medicine.stock < qty) {
      return res.status(400).json({ error: `Insufficient stock! Only ${medicine.stock} units available.` });
    }

    const sp = Number(sellingPrice) || medicine.sellingPrice;
    const cp = medicine.costPrice; // Save historical cost price

    // Create sales record
    const newSale = new Sales({
      medicineId: medicine._id,
      medicineName: medicine.name,
      quantity: qty,
      sellingPrice: sp,
      costPrice: cp,
      customerName: customerName || 'Walk-in Customer',
      date: date ? new Date(date) : new Date()
    });

    await newSale.save();

    // Deduct stock
    medicine.stock -= qty;
    await medicine.save();

    res.status(201).json(newSale);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error recording sale' });
  }
});

// ==========================================
// 4. DAILY / EOD REPORTS API ENDPOINT
// ==========================================

// GET end-of-day summary report for a specific date
app.get('/api/reports/daily', async (req, res) => {
  const dateStr = req.query.date; // Expect format: YYYY-MM-DD
  let startOfDay, endOfDay;

  if (dateStr) {
    const parts = dateStr.split('-');
    startOfDay = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 0, 0, 0));
    endOfDay = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 23, 59, 59, 999));
  } else {
    // Default to current date (local timezone bounds converted to Date objects)
    const today = new Date();
    startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
  }

  try {
    // Get sales in range
    const sales = await Sales.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    // Get purchases in range
    const purchases = await Purchase.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    // Calculate metrics
    let totalSalesRevenue = 0;
    let totalSalesCost = 0;
    let totalItemsSoldCount = 0;

    sales.forEach(sale => {
      totalSalesRevenue += (sale.sellingPrice * sale.quantity);
      totalSalesCost += (sale.costPrice * sale.quantity);
      totalItemsSoldCount += sale.quantity;
    });

    let totalPurchaseExpenses = 0;
    let totalItemsPurchasedCount = 0;

    purchases.forEach(p => {
      totalPurchaseExpenses += (p.costPrice * p.quantity);
      totalItemsPurchasedCount += p.quantity;
    });

    const netProfit = totalSalesRevenue - totalSalesCost;

    // Get low stock medicines
    const medicines = await Medicine.find();
    const lowStockAlerts = medicines.filter(med => med.stock <= med.lowStockThreshold);

    res.json({
      date: dateStr || new Date().toISOString().split('T')[0],
      totalSalesRevenue,
      totalSalesCost,
      netProfit,
      totalItemsSold: totalItemsSoldCount,
      totalPurchaseExpenses,
      totalItemsPurchased: totalItemsPurchasedCount,
      salesCount: sales.length,
      purchasesCount: purchases.length,
      lowStockAlerts: lowStockAlerts.map(med => ({
        id: med._id,
        name: med.name,
        stock: med.stock,
        threshold: med.lowStockThreshold
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error generating report' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
