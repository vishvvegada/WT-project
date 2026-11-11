import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Pill, 
  TrendingUp, 
  ShoppingCart, 
  Plus, 
  AlertTriangle, 
  Search, 
  Calendar,
  DollarSign, 
  Package, 
  User, 
  ArrowUpRight, 
  ArrowDownRight,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data States
  const [medicines, setMedicines] = useState([]);
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [report, setReport] = useState(null);
  
  // Filtering & Query States
  const [searchQuery, setSearchQuery] = useState('');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Form States - Add/Edit Medicine
  const [medForm, setMedForm] = useState({
    id: null,
    name: '',
    category: '',
    stock: 0,
    costPrice: '',
    sellingPrice: '',
    expiryDate: '',
    lowStockThreshold: 10
  });
  const [isEditing, setIsEditing] = useState(false);

  // Form States - Record Sale
  const [saleForm, setSaleForm] = useState({
    medicineId: '',
    quantity: 1,
    sellingPrice: '',
    customerName: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Form States - Record Purchase
  const [purchaseForm, setPurchaseForm] = useState({
    medicineId: '',
    quantity: 1,
    costPrice: '',
    supplier: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Toast notification state
  const [toast, setToast] = useState(null);

  // Helper to show notifications
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch initial data
  useEffect(() => {
    fetchMedicines();
    fetchSales();
    fetchPurchases();
  }, []);

  // Fetch report when date changes
  useEffect(() => {
    fetchDailyReport();
  }, [reportDate]);

  const fetchMedicines = async () => {
    try {
      const res = await fetch(`${API_BASE}/medicines`);
      const data = await res.json();
      if (res.ok) setMedicines(data);
    } catch (err) {
      console.error('Error fetching medicines:', err);
    }
  };

  const fetchSales = async () => {
    try {
      const res = await fetch(`${API_BASE}/sales`);
      const data = await res.json();
      if (res.ok) setSales(data);
    } catch (err) {
      console.error('Error fetching sales:', err);
    }
  };

  const fetchPurchases = async () => {
    try {
      const res = await fetch(`${API_BASE}/purchases`);
      const data = await res.json();
      if (res.ok) setPurchases(data);
    } catch (err) {
      console.error('Error fetching purchases:', err);
    }
  };

  const fetchDailyReport = async () => {
    try {
      const res = await fetch(`${API_BASE}/reports/daily?date=${reportDate}`);
      const data = await res.json();
      if (res.ok) setReport(data);
    } catch (err) {
      console.error('Error fetching report:', err);
    }
  };

  // Medicine Form Submit (Create or Update)
  const handleMedicineSubmit = async (e) => {
    e.preventDefault();
    if (!medForm.name || !medForm.category || !medForm.costPrice || !medForm.sellingPrice) {
      showToast('Please fill out all required fields', 'error');
      return;
    }

    const payload = {
      name: medForm.name,
      category: medForm.category,
      stock: Number(medForm.stock),
      costPrice: Number(medForm.costPrice),
      sellingPrice: Number(medForm.sellingPrice),
      expiryDate: medForm.expiryDate || null,
      lowStockThreshold: Number(medForm.lowStockThreshold)
    };

    try {
      let res, data;
      if (isEditing) {
        res = await fetch(`${API_BASE}/medicines/${medForm.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        data = await res.json();
      } else {
        res = await fetch(`${API_BASE}/medicines`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        data = await res.json();
      }

      if (res.ok) {
        showToast(isEditing ? 'Medicine updated successfully!' : 'Medicine added successfully!');
        resetMedForm();
        fetchMedicines();
        fetchDailyReport();
      } else {
        showToast(data.error || 'Operation failed', 'error');
      }
    } catch (err) {
      showToast('Server connection error', 'error');
    }
  };

  // Select Medicine for Edit
  const handleEditMedicine = (med) => {
    setMedForm({
      id: med._id,
      name: med.name,
      category: med.category,
      stock: med.stock,
      costPrice: med.costPrice,
      sellingPrice: med.sellingPrice,
      expiryDate: med.expiryDate ? med.expiryDate.split('T')[0] : '',
      lowStockThreshold: med.lowStockThreshold
    });
    setIsEditing(true);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete Medicine
  const handleDeleteMedicine = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;
    try {
      const res = await fetch(`${API_BASE}/medicines/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Medicine deleted successfully');
        fetchMedicines();
        fetchDailyReport();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to delete medicine', 'error');
      }
    } catch (err) {
      showToast('Server connection error', 'error');
    }
  };

  const resetMedForm = () => {
    setMedForm({
      id: null,
      name: '',
      category: '',
      stock: 0,
      costPrice: '',
      sellingPrice: '',
      expiryDate: '',
      lowStockThreshold: 10
    });
    setIsEditing(false);
  };

  // Record Sale Submit
  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    if (!saleForm.medicineId || !saleForm.quantity) {
      showToast('Please select a medicine and enter quantity', 'error');
      return;
    }

    const medicine = medicines.find(m => m._id === saleForm.medicineId);
    const payload = {
      medicineId: saleForm.medicineId,
      quantity: Number(saleForm.quantity),
      sellingPrice: saleForm.sellingPrice ? Number(saleForm.sellingPrice) : undefined,
      customerName: saleForm.customerName,
      date: saleForm.date
    };

    try {
      const res = await fetch(`${API_BASE}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Sale recorded! Stock of ${medicine.name} reduced.`);
        setSaleForm({
          medicineId: '',
          quantity: 1,
          sellingPrice: '',
          customerName: '',
          date: new Date().toISOString().split('T')[0]
        });
        fetchMedicines();
        fetchSales();
        fetchDailyReport();
      } else {
        showToast(data.error || 'Failed to record sale', 'error');
      }
    } catch (err) {
      showToast('Server connection error', 'error');
    }
  };

  // Record Purchase Submit
  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    if (!purchaseForm.medicineId || !purchaseForm.quantity) {
      showToast('Please select a medicine and enter quantity', 'error');
      return;
    }

    const medicine = medicines.find(m => m._id === purchaseForm.medicineId);
    const payload = {
      medicineId: purchaseForm.medicineId,
      quantity: Number(purchaseForm.quantity),
      costPrice: purchaseForm.costPrice ? Number(purchaseForm.costPrice) : undefined,
      supplier: purchaseForm.supplier,
      date: purchaseForm.date
    };

    try {
      const res = await fetch(`${API_BASE}/purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Stock updated! Added ${purchaseForm.quantity} units to ${medicine.name}.`);
        setPurchaseForm({
          medicineId: '',
          quantity: 1,
          costPrice: '',
          supplier: '',
          date: new Date().toISOString().split('T')[0]
        });
        fetchMedicines();
        fetchPurchases();
        fetchDailyReport();
      } else {
        showToast(data.error || 'Failed to record purchase', 'error');
      }
    } catch (err) {
      showToast('Server connection error', 'error');
    }
  };

  // Automatically update suggested prices on select dropdown changes
  const handleSaleMedChange = (e) => {
    const medId = e.target.value;
    const med = medicines.find(m => m._id === medId);
    setSaleForm({
      ...saleForm,
      medicineId: medId,
      sellingPrice: med ? med.sellingPrice : ''
    });
  };

  const handlePurchaseMedChange = (e) => {
    const medId = e.target.value;
    const med = medicines.find(m => m._id === medId);
    setPurchaseForm({
      ...purchaseForm,
      medicineId: medId,
      costPrice: med ? med.costPrice : ''
    });
  };

  // Filter medicines based on search
  const filteredMedicines = medicines.filter(med => 
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toast && (
        <div className="toast">
          {toast.type === 'success' ? (
            <CheckCircle size={20} color="#10b981" />
          ) : (
            <XCircle size={20} color="#ef4444" />
          )}
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{toast.message}</span>
        </div>
      )}

      {/* Main Header */}
      <header className="header">
        <div className="logo-section">
          <div className="logo-icon">
            <Pill size={24} />
          </div>
          <div>
            <h1 className="logo-text">MediStore</h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Management System</p>
          </div>
        </div>

        <nav className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={16} />
            Dashboard
          </button>
          <button 
            className={`nav-tab ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <Pill size={16} />
            Inventory
          </button>
          <button 
            className={`nav-tab ${activeTab === 'sales' ? 'active' : ''}`}
            onClick={() => setActiveTab('sales')}
          >
            <TrendingUp size={16} />
            Sales
          </button>
          <button 
            className={`nav-tab ${activeTab === 'purchases' ? 'active' : ''}`}
            onClick={() => setActiveTab('purchases')}
          >
            <ShoppingCart size={16} />
            Purchases
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        
        {/* ============================================================== */}
        {/* TAB 1: DASHBOARD & EOD REPORTS                                 */}
        {/* ============================================================== */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Control Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Overview & Reports</h2>
                <p style={{ color: 'var(--text-secondary)' }}>EOD summary logs and financial tracking</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--bg-surface)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <Calendar size={16} className="text-secondary" />
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Select Report Date:</span>
                <input 
                  type="date" 
                  value={reportDate} 
                  onChange={(e) => setReportDate(e.target.value)}
                  className="form-input"
                  style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Low Stock Alerts */}
            {report && report.lowStockAlerts && report.lowStockAlerts.length > 0 && (
              <div className="alert-banner">
                <AlertTriangle size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 className="alert-title">Low Stock Alert!</h4>
                  <p className="alert-message">
                    The following medications are running low. Please reorder soon: {' '}
                    {report.lowStockAlerts.map((med, idx) => (
                      <strong key={med.id} style={{ color: 'white' }}>
                        {med.name} ({med.stock} left){idx < report.lowStockAlerts.length - 1 ? ', ' : ''}
                      </strong>
                    ))}
                  </p>
                </div>
              </div>
            )}

            {/* Stats Cards */}
            {report ? (
              <div className="stats-grid">
                <div className="stat-card" style={{ '--accent-gradient': 'linear-gradient(#10b981, #059669)' }}>
                  <div className="stat-icon-wrapper">
                    <ArrowUpRight size={24} color="#10b981" />
                  </div>
                  <div className="stat-details">
                    <span className="stat-label">Sales Revenue</span>
                    <span className="stat-value">${report.totalSalesRevenue.toFixed(2)}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {report.salesCount} sale transactions
                    </span>
                  </div>
                </div>

                <div className="stat-card" style={{ '--accent-gradient': 'linear-gradient(#ef4444, #dc2626)' }}>
                  <div className="stat-icon-wrapper">
                    <ArrowDownRight size={24} color="#ef4444" />
                  </div>
                  <div className="stat-details">
                    <span className="stat-label">Purchase Expense</span>
                    <span className="stat-value">${report.totalPurchaseExpenses.toFixed(2)}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {report.purchasesCount} restock actions
                    </span>
                  </div>
                </div>

                <div className="stat-card" style={{ '--accent-gradient': 'linear-gradient(#6366f1, #3b82f6)' }}>
                  <div className="stat-icon-wrapper">
                    <DollarSign size={24} color="#6366f1" />
                  </div>
                  <div className="stat-details">
                    <span className="stat-label">Net Profit</span>
                    <span className="stat-value" style={{ color: report.netProfit >= 0 ? '#10b981' : '#ef4444' }}>
                      {report.netProfit >= 0 ? '+' : ''}${report.netProfit.toFixed(2)}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Calculated from items sold
                    </span>
                  </div>
                </div>

                <div className="stat-card" style={{ '--accent-gradient': 'linear-gradient(#f59e0b, #d97706)' }}>
                  <div className="stat-icon-wrapper">
                    <Package size={24} color="#f59e0b" />
                  </div>
                  <div className="stat-details">
                    <span className="stat-label">Volume Handled</span>
                    <span className="stat-value">{report.totalItemsSold + report.totalItemsPurchased} units</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {report.totalItemsSold} sold / {report.totalItemsPurchased} purchased
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading report metrics...</div>
            )}

            {/* Dashboard Lists layout */}
            <div className="dashboard-grid">
              
              {/* Daily Sales Log */}
              <div className="card">
                <h3 className="card-title">
                  <TrendingUp size={18} color="var(--success)" />
                  Sales Log ({reportDate})
                </h3>
                
                {sales.filter(s => s.date.split('T')[0] === reportDate).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    No sales recorded for this date.
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Medicine</th>
                          <th>Qty</th>
                          <th>Price/Unit</th>
                          <th>Total</th>
                          <th>Customer</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sales.filter(s => s.date.split('T')[0] === reportDate).map((sale) => (
                          <tr key={sale._id}>
                            <td style={{ fontWeight: 600 }}>{sale.medicineName}</td>
                            <td>{sale.quantity}</td>
                            <td>${sale.sellingPrice.toFixed(2)}</td>
                            <td style={{ fontWeight: 600, color: 'var(--success)' }}>
                              ${(sale.sellingPrice * sale.quantity).toFixed(2)}
                            </td>
                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{sale.customerName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Daily Purchases Log */}
              <div className="card">
                <h3 className="card-title">
                  <ShoppingCart size={18} color="var(--warning)" />
                  Purchases Log ({reportDate})
                </h3>
                
                {purchases.filter(p => p.date.split('T')[0] === reportDate).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    No stock purchases recorded for this date.
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Item Name</th>
                          <th>Qty</th>
                          <th>Cost</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {purchases.filter(p => p.date.split('T')[0] === reportDate).map((p) => (
                          <tr key={p._id}>
                            <td style={{ fontWeight: 600 }}>{p.medicineName}</td>
                            <td>{p.quantity}</td>
                            <td>${p.costPrice.toFixed(2)}</td>
                            <td style={{ fontWeight: 600, color: 'var(--danger)' }}>
                              ${(p.costPrice * p.quantity).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: MEDICINES INVENTORY                                     */}
        {/* ============================================================== */}
        {activeTab === 'inventory' && (
          <div className="dashboard-grid">
            
            {/* List of Medicines */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 className="card-title" style={{ marginBottom: 0 }}>
                  <Pill size={18} color="var(--primary)" />
                  Medications & Stock levels
                </h3>
                
                {/* Search Bar */}
                <div className="search-wrapper" style={{ marginBottom: 0, width: '250px' }}>
                  <Search size={16} className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search medicines/category..."
                    className="form-input search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {filteredMedicines.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                  No medications found matching your criteria.
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Medication Name</th>
                        <th>Category</th>
                        <th>Stock Qty</th>
                        <th>Cost Price</th>
                        <th>Sale Price</th>
                        <th>Expiry Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMedicines.map((med) => {
                        const isLowStock = med.stock <= med.lowStockThreshold;
                        const isOutOfStock = med.stock === 0;
                        const isExpired = med.expiryDate && new Date(med.expiryDate) < new Date();

                        return (
                          <tr key={med._id}>
                            <td>
                              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{med.name}</div>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.8rem', backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '6px', color: 'var(--text-secondary)' }}>
                                {med.category}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontWeight: 700 }}>{med.stock}</span>
                                {isOutOfStock ? (
                                  <span className="badge badge-danger">Out</span>
                                ) : isLowStock ? (
                                  <span className="badge badge-warning">Low</span>
                                ) : (
                                  <span className="badge badge-success">OK</span>
                                )}
                              </div>
                            </td>
                            <td>${med.costPrice.toFixed(2)}</td>
                            <td style={{ fontWeight: 600, color: 'var(--primary)' }}>${med.sellingPrice.toFixed(2)}</td>
                            <td>
                              {med.expiryDate ? (
                                <span style={{ color: isExpired ? '#ef4444' : 'var(--text-primary)', fontSize: '0.85rem' }}>
                                  {new Date(med.expiryDate).toLocaleDateString()}
                                  {isExpired && ' (Expired)'}
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>N/A</span>
                              )}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button 
                                  className="btn btn-secondary" 
                                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                                  onClick={() => handleEditMedicine(med)}
                                >
                                  Edit
                                </button>
                                <button 
                                  className="btn btn-danger" 
                                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                                  onClick={() => handleDeleteMedicine(med._id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Add/Edit Form */}
            <div className="card">
              <h3 className="card-title">
                {isEditing ? <FileText size={18} color="var(--warning)" /> : <Plus size={18} color="var(--primary)" />}
                {isEditing ? 'Edit Medicine Attributes' : 'Register New Medicine'}
              </h3>

              <form onSubmit={handleMedicineSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Medicine Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Paracetamol 500mg" 
                      className="form-input"
                      value={medForm.name}
                      onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Analgesics, Antibiotics" 
                      className="form-input"
                      value={medForm.category}
                      onChange={(e) => setMedForm({ ...medForm, category: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Cost Price ($) *</label>
                      <input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00" 
                        className="form-input"
                        value={medForm.costPrice}
                        onChange={(e) => setMedForm({ ...medForm, costPrice: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Selling Price ($) *</label>
                      <input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00" 
                        className="form-input"
                        value={medForm.sellingPrice}
                        onChange={(e) => setMedForm({ ...medForm, sellingPrice: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Initial Stock Level</label>
                      <input 
                        type="number" 
                        placeholder="0" 
                        className="form-input"
                        value={medForm.stock}
                        onChange={(e) => setMedForm({ ...medForm, stock: e.target.value })}
                        disabled={isEditing} // Update stock via Purchases / Sales instead
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Alert Stock Level</label>
                      <input 
                        type="number" 
                        className="form-input"
                        value={medForm.lowStockThreshold}
                        onChange={(e) => setMedForm({ ...medForm, lowStockThreshold: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input 
                      type="date" 
                      className="form-input"
                      value={medForm.expiryDate}
                      onChange={(e) => setMedForm({ ...medForm, expiryDate: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>
                      {isEditing ? 'Save Changes' : 'Add Medication'}
                    </button>
                    {isEditing && (
                      <button type="button" className="btn btn-secondary" onClick={resetMedForm}>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: RECORD SALES                                            */}
        {/* ============================================================== */}
        {activeTab === 'sales' && (
          <div className="dashboard-grid">
            
            {/* Record Sale Form */}
            <div className="card">
              <h3 className="card-title">
                <TrendingUp size={18} color="var(--success)" />
                Record Customer Sale
              </h3>

              <form onSubmit={handleSaleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  <div className="form-group">
                    <label className="form-label">Select Medication *</label>
                    <select 
                      className="form-select"
                      value={saleForm.medicineId}
                      onChange={handleSaleMedChange}
                      required
                    >
                      <option value="">-- Select Medicine --</option>
                      {medicines.map(m => (
                        <option key={m._id} value={m._id} disabled={m.stock <= 0}>
                          {m.name} (Stock: {m.stock} units | Price: ${m.sellingPrice.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Sale Quantity *</label>
                      <input 
                        type="number" 
                        min="1"
                        className="form-input"
                        value={saleForm.quantity}
                        onChange={(e) => setSaleForm({ ...saleForm, quantity: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Selling Price Per Unit ($)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        placeholder="Default Price" 
                        className="form-input"
                        value={saleForm.sellingPrice}
                        onChange={(e) => setSaleForm({ ...saleForm, sellingPrice: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Customer Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                      <input 
                        type="text" 
                        placeholder="e.g. John Doe / Patient" 
                        className="form-input"
                        style={{ paddingLeft: '2.5rem' }}
                        value={saleForm.customerName}
                        onChange={(e) => setSaleForm({ ...saleForm, customerName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Sale Date</label>
                    <input 
                      type="date" 
                      className="form-input"
                      value={saleForm.date}
                      onChange={(e) => setSaleForm({ ...saleForm, date: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                    Submit Sale & Deduct Stock
                  </button>

                </div>
              </form>
            </div>

            {/* Recent Sales History */}
            <div className="card">
              <h3 className="card-title">
                <FileText size={18} color="var(--text-secondary)" />
                Recent Sales Transaction History
              </h3>

              {sales.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No sales recorded yet.
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Medicine</th>
                        <th>Qty</th>
                        <th>Sale Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.slice(0, 10).map((sale) => (
                        <tr key={sale._id}>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {new Date(sale.date).toLocaleDateString()}
                          </td>
                          <td style={{ fontWeight: 600 }}>{sale.medicineName}</td>
                          <td>{sale.quantity}</td>
                          <td>${sale.sellingPrice.toFixed(2)}</td>
                          <td style={{ fontWeight: 600, color: 'var(--success)' }}>
                            ${(sale.sellingPrice * sale.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: RECORD PURCHASES                                        */}
        {/* ============================================================== */}
        {activeTab === 'purchases' && (
          <div className="dashboard-grid">
            
            {/* Record Purchase Form */}
            <div className="card">
              <h3 className="card-title">
                <ShoppingCart size={18} color="var(--warning)" />
                Record Stock Acquisition (Purchase)
              </h3>

              <form onSubmit={handlePurchaseSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  <div className="form-group">
                    <label className="form-label">Select Medication *</label>
                    <select 
                      className="form-select"
                      value={purchaseForm.medicineId}
                      onChange={handlePurchaseMedChange}
                      required
                    >
                      <option value="">-- Select Medicine --</option>
                      {medicines.map(m => (
                        <option key={m._id} value={m._id}>
                          {m.name} (Current Stock: {m.stock} units | Cost: ${m.costPrice.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Purchased Quantity *</label>
                      <input 
                        type="number" 
                        min="1"
                        className="form-input"
                        value={purchaseForm.quantity}
                        onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Purchase Cost Price Per Unit ($)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        placeholder="Default Cost" 
                        className="form-input"
                        value={purchaseForm.costPrice}
                        onChange={(e) => setPurchaseForm({ ...purchaseForm, costPrice: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Supplier Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Pfizer Distributing, Inc." 
                      className="form-input"
                      value={purchaseForm.supplier}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, supplier: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Purchase Date</label>
                    <input 
                      type="date" 
                      className="form-input"
                      value={purchaseForm.date}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, date: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                    Add Stock & Save Purchase Record
                  </button>

                </div>
              </form>
            </div>

            {/* Recent Purchases History */}
            <div className="card">
              <h3 className="card-title">
                <FileText size={18} color="var(--text-secondary)" />
                Recent Restocks History
              </h3>

              {purchases.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No purchases recorded yet.
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Medicine</th>
                        <th>Qty</th>
                        <th>Cost Price</th>
                        <th>Total Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchases.slice(0, 10).map((p) => (
                        <tr key={p._id}>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {new Date(p.date).toLocaleDateString()}
                          </td>
                          <td style={{ fontWeight: 600 }}>{p.medicineName}</td>
                          <td>{p.quantity}</td>
                          <td>${p.costPrice.toFixed(2)}</td>
                          <td style={{ fontWeight: 600, color: 'var(--danger)' }}>
                            ${(p.costPrice * p.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

      </main>
      
      <footer style={{ textAlign: 'center', padding: '2rem 1.5rem', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 'auto', backgroundColor: 'rgba(19, 26, 38, 0.4)' }}>
        <p>&copy; 2026 MediStore Medical Store Management. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
