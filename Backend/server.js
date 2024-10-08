const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Sales = require('./salesSchema');
const app = express();

app.use(express.json()); // Correct usage of express.json()
app.use(bodyParser.urlencoded({ extended: true }));

// Connecting to MongoDB
mongoose.connect('mongodb+srv://Vishvvegada53:vishv5306@cluster0.985sd.mongodb.net/shop', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// POST route to add sales data
app.post('/api/sales', async (req, res) => {
  const { date, sellingPrice, costPrice } = req.body;

  const newSale = new Sales({
    date,
    sellingPrice,
    costPrice,
  });

  try {
    await newSale.save();
    res.send('Sales data added successfully!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding sales data!');
  }
});

// GET route to fetch monthly profit/loss
app.get('/api/profit', async (req, res) => {
  const startOfMonth = new Date(new Date().setDate(1));  // Start of the month
  const endOfMonth = new Date();  // Current date as end of the month

  try {
    const salesData = await Sales.find({
    date: { $gte: startOfMonth, $lt: endOfMonth },
    });

    const totalSelling = 0;  // Change 'const' to 'let' for reassignment
    const totalCost = 0;  // Change 'const' to 'let' for reassignment

    // Calculate total selling price and cost price
    salesData.forEach((sale) => {
      totalSelling += sale.sellingPrice;
      totalCost += sale.costPrice;
    });

    const profit = totalSelling - totalCost;
    res.json({ profit });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching profit data!');
  }
});

// Start the server
app.listen(5000, () => {
  console.log('Server running on port 5000');
});
