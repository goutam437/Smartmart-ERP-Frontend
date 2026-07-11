
// =============================================
//  SmartMart ERP — js/app.js
// =============================================
 
const API_BASE = 'https://smartmart-erp-backend-production-c56c.up.railway.app/api/';
const API = API_BASE + '/api';
let cart = [];
let allProducts = [];
 
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    fillUserInfo();
    loadModule('dashboard', document.querySelector('.nav-item.active'));
});
 
function checkAuth() {
    if (!localStorage.getItem('token')) window.location.href = 'login.html';
}
 
function fillUserInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const name = user.name || 'Admin';
    const initial = name[0].toUpperCase();
    const ids = ['sidebarName','sidebarAvatar','topbarName','topbarAvatar'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = id.includes('Name') ? name : initial;
    });
}
 
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('hidden');
    document.querySelector('.main-wrap').classList.toggle('full');
}
 
function handleLogout() {
    localStorage.clear();
    window.location.href = 'login.html';
}
 
function setActiveNav(el) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (el) el.classList.add('active');
}
 
function showToast(msg, type = 'success') {
    const box = document.getElementById('toastContainer');
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(() => { t.style.opacity='0'; t.style.transition='opacity 0.3s'; setTimeout(()=>t.remove(),300); }, 3000);
}
 
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) {
    document.getElementById(id).classList.remove('open');
    document.querySelectorAll(`#${id} input`).forEach(i => i.value = '');
}
 
window.addEventListener('click', e => {
    document.querySelectorAll('.modal-overlay').forEach(m => {
        if (e.target === m) m.classList.remove('open');
    });
});
 
function loadModule(name, el) {
    setActiveNav(el);
    const titles = { dashboard:'Dashboard', billing:'Billing / POS', inventory:'Inventory', customers:'Customers', sales:'Sales', settings:'Settings' };
    document.getElementById('pageTitle').textContent = titles[name] || '';
    switch(name) {
        case 'dashboard': renderDashboard(); break;
        case 'billing':   renderBilling();   break;
        case 'inventory': renderInventory(); break;
        case 'customers': renderCustomers(); break;
        case 'sales':     renderSales();     break;
        case 'settings':  renderSettings();  break;
    }
}
 
// ── 1. DASHBOARD (MODERN & DARK MODE READY) ──
async function renderDashboard() {
    document.getElementById('content-area').innerHTML = `
        <style>
            /* Dashboard Specific Modern Styles */
            .dash-card {
                background: var(--bg-card, #ffffff);
                border: 1px solid var(--border-color, #e5e7eb);
                padding: 24px;
                border-radius: 12px;
                box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                display: flex;
                align-items: center;
                gap: 18px;
                transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.3s ease, border-color 0.3s ease;
            }
            .dash-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
            }
            .dash-icon {
                font-size: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 60px;
                height: 60px;
                border-radius: 12px;
            }
            .dash-table-container {
                background: var(--bg-card, #ffffff);
                border: 1px solid var(--border-color, #e5e7eb);
                padding: 24px;
                border-radius: 12px;
                box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                transition: background 0.3s ease, border-color 0.3s ease;
            }
            .dash-table {
                width: 100%;
                border-collapse: collapse;
                text-align: left;
            }
            .dash-table th {
                color: var(--text-muted, #6b7280);
                font-size: 13px;
                font-weight: 600;
                padding: 12px 10px;
                border-bottom: 2px solid var(--border-color, #e5e7eb);
            }
            .dash-table td {
                color: var(--text-main, #1f2937);
                font-size: 14px;
                padding: 14px 10px;
                border-bottom: 1px solid var(--border-color, #e5e7eb);
            }
            /* Dark Mode friendly badges using RGBA */
            .badge-success { background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; }
            .badge-danger { background: rgba(239, 68, 68, 0.15); color: #ef4444; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; }
        </style>

        <!-- Header Section -->
        <div class="page-header" style="margin-bottom: 28px;">
            <div>
                <h1 style="margin:0; font-size: 28px; font-weight: 700; color: var(--text-main, #1f2937); letter-spacing: -0.5px;">Dashboard Overview</h1>
                <p style="color: var(--text-muted, #6b7280); margin-top: 6px; font-size: 14px;">Here is what's happening in your store today.</p>
            </div>
        </div>

        <!-- Top Stat Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; margin-bottom: 32px;">
            
            <div class="dash-card" style="border-bottom: 4px solid #3b82f6;">
                <div class="dash-icon" style="background: rgba(59, 130, 246, 0.1);">💰</div>
                <div>
                    <div style="font-size:26px; font-weight:700; color: var(--text-main, #111827);" id="statSales">--</div>
                    <div style="color: var(--text-muted, #6b7280); font-size:13px; font-weight: 500; margin-top: 4px;">TOTAL BILLS</div>
                </div>
            </div>
            
            <div class="dash-card" style="border-bottom: 4px solid #10b981;">
                <div class="dash-icon" style="background: rgba(16, 185, 129, 0.1);">📦</div>
                <div>
                    <div style="font-size:26px; font-weight:700; color: var(--text-main, #111827);" id="statProducts">--</div>
                    <div style="color: var(--text-muted, #6b7280); font-size:13px; font-weight: 500; margin-top: 4px;">TOTAL PRODUCTS</div>
                </div>
            </div>
            
            <div class="dash-card" style="border-bottom: 4px solid #f59e0b;">
                <div class="dash-icon" style="background: rgba(245, 158, 11, 0.1);">👥</div>
                <div>
                    <div style="font-size:26px; font-weight:700; color: var(--text-main, #111827);" id="statCustomers">--</div>
                    <div style="color: var(--text-muted, #6b7280); font-size:13px; font-weight: 500; margin-top: 4px;">TOTAL CUSTOMERS</div>
                </div>
            </div>
            
            <div class="dash-card" style="border-bottom: 4px solid #ef4444;">
                <div class="dash-icon" style="background: rgba(239, 68, 68, 0.1);">⚠️</div>
                <div>
                    <div style="font-size:26px; font-weight:700; color: var(--text-main, #111827);" id="statLowStock">--</div>
                    <div style="color: var(--text-muted, #6b7280); font-size:13px; font-weight: 500; margin-top: 4px;">LOW STOCK ALERTS</div>
                </div>
            </div>

        </div>

        <!-- Tables Section -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px;">
            
            <!-- Recent Bills Table -->
            <div class="dash-table-container">
                <h2 style="font-size:18px; font-weight: 600; color: var(--text-main, #1f2937); margin-top:0; margin-bottom:16px; border-bottom:1px solid var(--border-color, #e5e7eb); padding-bottom:12px; display:flex; align-items:center; gap:8px;">
                    🧾 Recent Bills
                </h2>
                <div style="overflow-x: auto;">
                    <table class="dash-table">
                        <thead><tr><th>CUSTOMER</th><th>AMOUNT</th><th>PAYMENT</th></tr></thead>
                        <tbody id="recentBillsBody">
                            <tr><td colspan="3" style="text-align:center; padding:30px; color:var(--text-muted);">Loading data...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Low Stock Table -->
            <div class="dash-table-container">
                <h2 style="font-size:18px; font-weight: 600; color: var(--text-main, #1f2937); margin-top:0; margin-bottom:16px; border-bottom:1px solid var(--border-color, #e5e7eb); padding-bottom:12px; display:flex; align-items:center; gap:8px;">
                    📉 Low Stock Items
                </h2>
                <div style="overflow-x: auto;">
                    <table class="dash-table">
                        <thead><tr><th>PRODUCT NAME</th><th>STOCK</th><th>STATUS</th></tr></thead>
                        <tbody id="lowStockBody">
                            <tr><td colspan="3" style="text-align:center; padding:30px; color:var(--text-muted);">Loading data...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>`;

    try {
        const [products, customers, bills, lowStock] = await Promise.all([
            fetch(`${API}/products`).then(r=>r.json()), fetch(`${API}/customers`).then(r=>r.json()),
            fetch(`${API}/billing`).then(r=>r.json()), fetch(`${API}/products/low-stock`).then(r=>r.json())
        ]);
        
        document.getElementById('statSales').textContent = bills.length;
        document.getElementById('statProducts').textContent = products.length;
        document.getElementById('statCustomers').textContent = customers.length;
        document.getElementById('statLowStock').textContent = lowStock.length;
 
        // Populate Bills Table
        const billBody = document.getElementById('recentBillsBody');
        billBody.innerHTML = bills.length === 0 ? `<tr><td colspan="3" style="text-align:center; padding:30px; color:var(--text-muted);">No bills generated yet.</td></tr>`
            : bills.slice(-5).reverse().map(b => `
                <tr>
                    <td><div style="font-weight: 500;">${b.customerName || 'Walk-in Customer'}</div></td>
                    <td><b>₹${b.grandTotal?.toFixed(2)}</b></td>
                    <td><span class="badge-success">${b.paymentMode || 'CASH'}</span></td>
                </tr>`).join('');
 
        // Populate Low Stock Table
        const lsBody = document.getElementById('lowStockBody');
        lsBody.innerHTML = lowStock.length === 0 ? `<tr><td colspan="3" style="text-align:center; padding:30px; color:var(--text-muted);">All products are well stocked ✅</td></tr>`
            : lowStock.map(p => `
                <tr>
                    <td><div style="font-weight: 500;">${p.name}</div></td>
                    <td><b style="color: #ef4444; font-size: 15px;">${p.stockQty}</b></td>
                    <td><span class="badge-danger">Low Stock</span></td>
                </tr>`).join('');
                
        // Agar aapne global theme engine function banaya hai, toh usko yaha trigger kar sakte hai
        // if(typeof applyThemeStateToCurrentView === 'function') applyThemeStateToCurrentView();

    } catch(err) { 
        showToast('Backend se connect nahi ho paya ⚠️', 'error'); 
        console.error("Dashboard Fetch Error:", err);
    }
}
// ── 2. INVENTORY (MODERN, WORKING & THEME PERSISTENT) ──

// Global State (Keeps data synchronized across all actions)
let inventoryData = [
    { id: 1, name: "Dell XPS 13", category: "Electronics", price: 95000, stock: 15, gst: "18%" },
    { id: 2, name: "Ergonomic Chair", category: "Furniture", price: 12000, stock: 3, gst: "12%" },
    { id: 3, name: "Wireless Mouse", category: "Accessories", price: 1500, stock: 0, gst: "18%" }
];

async function renderInventory() {
    document.getElementById('content-area').innerHTML = `
        <style>
            .inv-header {
                color: var(--text-main, #1f2937);
                transition: color 0.3s ease;
            }
            .inv-search-bar {
                background: var(--bg-card, #ffffff);
                padding: 18px 24px;
                border-radius: 12px 12px 0 0;
                border: 1px solid var(--border-color, #e5e7eb);
                border-bottom: none;
                transition: background 0.3s ease, border-color 0.3s ease;
            }
            .inv-search-input {
                width: 100%;
                max-width: 320px;
                padding: 10px 16px;
                background: var(--bg-card, #ffffff);
                color: var(--text-main, #1f2937);
                border: 1px solid var(--border-color, #d1d5db);
                border-radius: 8px;
                font-size: 14px;
                transition: all 0.2s ease-in-out;
            }
            .inv-search-input:focus {
                border-color: #3b82f6 !important;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important;
                outline: none;
            }
            .inv-table-wrapper {
                background: var(--bg-card, #ffffff);
                border-radius: 0 0 12px 12px;
                border: 1px solid var(--border-color, #e5e7eb);
                box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                overflow-x: auto;
                transition: background 0.3s ease, border-color 0.3s ease;
            }
            .inv-table {
                width: 100%;
                border-collapse: collapse;
                text-align: left;
            }
            .inv-table th {
                background: var(--tab-hover, #f9fafb);
                color: var(--text-muted, #4b5563);
                font-size: 13px;
                font-weight: 600;
                padding: 16px;
                border-bottom: 2px solid var(--border-color, #e5e7eb);
                letter-spacing: 0.5px;
            }
            .inv-table tr {
                border-bottom: 1px solid var(--border-color, #f3f4f6);
                transition: background 0.2s ease;
            }
            .inv-table tbody tr:hover {
                background: var(--tab-hover, rgba(59, 130, 246, 0.02));
            }
            .inv-table td {
                padding: 16px;
                font-size: 14px;
                color: var(--text-main, #1f2937);
            }
            
            /* Action Buttons CSS */
            .action-btn-edit { background: transparent; border: none; color: #3b82f6; font-weight: 600; cursor: pointer; margin-right: 14px; padding: 6px 10px; border-radius: 6px; transition: all 0.2s; }
            .action-btn-edit:hover { background: rgba(59, 130, 246, 0.1); }
            
            .action-btn-delete { background: transparent; border: none; color: #ef4444; font-weight: 600; cursor: pointer; padding: 6px 10px; border-radius: 6px; transition: all 0.2s; }
            .action-btn-delete:hover { background: rgba(239, 68, 68, 0.1); }

            /* Alpha Badges for Perfect Dark/Light Mode blending */
            .status-badge { padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; display: inline-block; }
            .status-instock { background: rgba(16, 185, 129, 0.15); color: #10b981; }
            .status-lowstock { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
            .status-outstock { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
        </style>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:28px;">
            <div class="inv-header">
                <h1 style="margin:0; font-size:28px; font-weight: 700; letter-spacing: -0.5px;">Inventory</h1>
                <p style="color: var(--text-muted, #6b7280); margin-top:6px; font-size: 14px;">Manage and monitor your central product stock list.</p>
            </div>
            <button style="background:#3b82f6; color:#fff; border:none; padding:12px 22px; border-radius:8px; cursor:pointer; font-weight:600; font-size: 14px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.15); transition: all 0.2s;" 
                    onclick="openProductModal()">
                + Add Product
            </button>
        </div>

        <div class="inv-search-bar">
            <input id="productSearch" placeholder="🔍 Search products or categories..." onkeyup="filterProducts()" class="inv-search-input">
        </div>

        <div class="inv-table-wrapper">
            <table class="inv-table">
                <thead>
                    <tr>
                        <th>PRODUCT</th>
                        <th>CATEGORY</th>
                        <th>PRICE</th>
                        <th>STOCK</th>
                        <th>GST</th>
                        <th>STATUS</th>
                        <th style="text-align:right; padding-right: 24px;">ACTION</th>
                    </tr>
                </thead>
                <tbody id="productTableBody">
                    <tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-muted);">Loading system products...</td></tr>
                </tbody>
            </table>
        </div>
        
        <!-- Dynamic Modal for Add/Edit Actions -->
        <div id="productModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; justify-content:center; align-items:center;">
            <div style="background:var(--bg-card, white); padding:24px; border-radius:12px; width:100%; max-width:400px; box-shadow:0 10px 25px rgba(0,0,0,0.1);">
                <h3 id="modalTitle" style="margin-top:0; margin-bottom:20px; color:var(--text-main); font-family:inherit;">Add Product</h3>
                <input type="hidden" id="modalProductId">
                <div style="margin-bottom:12px;">
                    <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--text-main);">Product Name</label>
                    <input type="text" id="modalName" style="width:100%; padding:8px; border:1px solid var(--border-color, #ccc); border-radius:6px; box-sizing:border-box;">
                </div>
                <div style="margin-bottom:12px;">
                    <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--text-main);">Category</label>
                    <input type="text" id="modalCategory" style="width:100%; padding:8px; border:1px solid var(--border-color, #ccc); border-radius:6px; box-sizing:border-box;">
                </div>
                <div style="margin-bottom:12px;">
                    <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--text-main);">Price (₹)</label>
                    <input type="number" id="modalPrice" style="width:100%; padding:8px; border:1px solid var(--border-color, #ccc); border-radius:6px; box-sizing:border-box;">
                </div>
                <div style="margin-bottom:12px;">
                    <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--text-main);">Stock Qty</label>
                    <input type="number" id="modalStock" style="width:100%; padding:8px; border:1px solid var(--border-color, #ccc); border-radius:6px; box-sizing:border-box;">
                </div>
                <div style="margin-bottom:20px;">
                    <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:var(--text-main);">GST (%)</label>
                    <input type="text" id="modalGst" value="18%" style="width:100%; padding:8px; border:1px solid var(--border-color, #ccc); border-radius:6px; box-sizing:border-box;">
                </div>
                <div style="display:flex; justify-content:flex-end; gap:10px;">
                    <button onclick="closeProductModal()" style="background:#e5e7eb; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:600;">Cancel</button>
                    <button onclick="saveProduct()" style="background:#3b82f6; color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:600;">Save</button>
                </div>
            </div>
        </div>
    `;
    
    // Initial Render of data
    loadProducts();
}

// 1. Data Loader & Render Engine
function loadProducts(filteredData = inventoryData) {
    const tbody = document.getElementById('productTableBody');
    if (!tbody) return;

    if (filteredData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-muted);">No products found.</td></tr>`;
        return;
    }

    tbody.innerHTML = filteredData.map(prod => {
        // Compute Status Badges dynamically based on available stock
        let statusClass = "status-instock";
        let statusText = "In Stock";
        if (parseInt(prod.stock) === 0) {
            statusClass = "status-outstock";
            statusText = "Out of Stock";
        } else if (parseInt(prod.stock) <= 5) {
            statusClass = "status-lowstock";
            statusText = "Low Stock";
        }

        return `
            <tr>
                <td style="font-weight: 600;">${prod.name}</td>
                <td>${prod.category}</td>
                <td>₹${Number(prod.price).toLocaleString('en-IN')}</td>
                <td>${prod.stock}</td>
                <td>${prod.gst}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td style="text-align:right; padding-right: 24px;">
                    <button class="action-btn-edit" onclick="openProductModal(${prod.id})">Edit</button>
                    <button class="action-btn-delete" onclick="deleteProduct(${prod.id})">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// 2. Live Search / Filter Engine
function filterProducts() {
    const query = document.getElementById('productSearch').value.toLowerCase();
    const filtered = inventoryData.filter(prod => 
        prod.name.toLowerCase().includes(query) || 
        prod.category.toLowerCase().includes(query)
    );
    loadProducts(filtered);
}

// 3. Modal Handlers (Controls visibility and state mapping)
function openProductModal(id = null) {
    const modal = document.getElementById('productModal');
    modal.style.display = 'flex';
    
    if (id) {
        document.getElementById('modalTitle').innerText = "Edit Product";
        const prod = inventoryData.find(p => p.id === id);
        document.getElementById('modalProductId').value = prod.id;
        document.getElementById('modalName').value = prod.name;
        document.getElementById('modalCategory').value = prod.category;
        document.getElementById('modalPrice').value = prod.price;
        document.getElementById('modalStock').value = prod.stock;
        document.getElementById('modalGst').value = prod.gst;
    } else {
        document.getElementById('modalTitle').innerText = "Add Product";
        document.getElementById('modalProductId').value = "";
        document.getElementById('modalName').value = "";
        document.getElementById('modalCategory').value = "";
        document.getElementById('modalPrice').value = "";
        document.getElementById('modalStock').value = "";
        document.getElementById('modalGst').value = "18%";
    }
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
}

// 4. Upsert Action (Creates a new item or Updates an existing one)
function saveProduct() {
    const id = document.getElementById('modalProductId').value;
    const name = document.getElementById('modalName').value.trim();
    const category = document.getElementById('modalCategory').value.trim();
    const price = parseFloat(document.getElementById('modalPrice').value) || 0;
    const stock = parseInt(document.getElementById('modalStock').value) || 0;
    const gst = document.getElementById('modalGst').value.trim();

    if (!name || !category) {
        alert("Please completely fill out Name and Category details.");
        return;
    }

    if (id) {
        // Edit Action
        const index = inventoryData.findIndex(p => p.id == id);
        if (index !== -1) {
            inventoryData[index] = { id: parseInt(id), name, category, price, stock, gst };
        }
    } else {
        // Add Action
        const newId = inventoryData.length > 0 ? Math.max(...inventoryData.map(p => p.id)) + 1 : 1;
        inventoryData.push({ id: newId, name, category, price, stock, gst });
    }

    closeProductModal();
    loadProducts();
    
    // Clear search values to reveal the newly mutations properly
    document.getElementById('productSearch').value = ""; 
}

// 5. Destructive Action (Removes an entry securely)
function deleteProduct(id) {
    if (confirm("Are you certain you want to remove this product from the master record?")) {
        inventoryData = inventoryData.filter(p => p.id !== id);
        loadProducts();
    }
}

 
// ── 3. BILLING ──
async function renderBilling() {
    cart = [];
    document.getElementById('content-area').innerHTML = `
        <div class="page-header"><div><h1>Billing / POS</h1></div></div>
        <div class="pos-layout">
            <div class="pos-left">
                <div class="pos-head">Products</div>
                <div class="pos-body">
                    <input class="search-bar" id="posSearch" placeholder="🔍 Search..." onkeyup="filterPosProducts()" style="width:100%;margin-bottom:12px">
                    <div class="product-grid" id="posProductGrid"><p style="color:#9ca3af">Loading...</p></div>
                </div>
            </div>
            <div class="pos-right">
                <div class="pos-head">🛒 Cart</div>
                <div class="pos-body" style="display:flex;flex-direction:column;gap:10px">
                    <div class="form-group"><label>Customer Name</label><input type="text" id="billCustomerName" placeholder="Walk-in Customer"></div>
                    <div class="form-group"><label>Payment Mode</label>
                        <select id="billPayMode"><option value="CASH">💵 Cash</option><option value="CARD">💳 Card</option><option value="UPI">📱 UPI</option></select>
                    </div>
                    <div id="cartList" style="flex:1;overflow-y:auto"><p style="text-align:center;color:#9ca3af;padding:20px">Cart is empty</p></div>
                    <div class="gst-box" id="gstSummary" style="display:none">
                        <div class="gst-row"><span>Subtotal</span><span id="billSubtotal">₹0</span></div>
                        <div class="gst-row"><span>CGST (9%)</span><span id="billCgst">₹0</span></div>
                        <div class="gst-row"><span>SGST (9%)</span><span id="billSgst">₹0</span></div>
                        <div class="gst-row total"><span>Grand Total</span><span id="billTotal">₹0</span></div>
                    </div>
                    <button class="btn btn-primary btn-full" onclick="createBill()">💳 Generate Bill</button>
                </div>

            </div>
        </div>`;
    await loadPosProducts();
}
 
async function loadPosProducts() {
    try {
        const products = await fetch(`${API}/products`).then(r=>r.json());
        allProducts = products.filter(p=>p.stockQty>0);
        renderPosGrid(allProducts);
    } catch { showToast('Products load nahi hue','error'); }
}
 
function renderPosGrid(products) {
    const grid = document.getElementById('posProductGrid');
    if (!grid) return;
    grid.innerHTML = products.length === 0
        ? `<p style="color:#9ca3af">No products</p>`
        : products.map(p=>`<div class="product-tile" onclick="addToCart('${p.id}','${p.name.replace(/'/g,"\\'")}',${p.price},${p.gstRate},${p.stockQty})">
            <div class="pt-name">${p.name}</div><div class="pt-price">₹${p.price}</div><div class="pt-stock">Stock: ${p.stockQty}</div></div>`).join('');
}
 
function filterPosProducts() {
    const q = document.getElementById('posSearch').value.toLowerCase();
    renderPosGrid(allProducts.filter(p=>p.name.toLowerCase().includes(q)));
}
 
function addToCart(id, name, price, gstRate, stock) {
    const ex = cart.find(i=>i.productId===id);
    if (ex) { if(ex.qty>=stock){showToast('Stock limit!','warning');return;} ex.qty++; }
    else cart.push({productId:id,name,price,gstRate,qty:1,stock});
    renderCart(); showToast(`${name} added!`);
}
 
function updateQty(id, delta) {
    const item = cart.find(i=>i.productId===id);
    if (!item) return;
    item.qty += delta;
    if (item.qty<=0) cart = cart.filter(i=>i.productId!==id);
    renderCart();
}
 
function removeFromCart(id) { cart=cart.filter(i=>i.productId!==id); renderCart(); }
 
function renderCart() {
    const list=document.getElementById('cartList'), summary=document.getElementById('gstSummary');
    if (!list) return;
    if (cart.length===0) { list.innerHTML=`<p style="text-align:center;color:#9ca3af;padding:20px">Cart is empty</p>`; if(summary)summary.style.display='none'; return; }
    list.innerHTML = cart.map(item=>`
        <div class="cart-item">
            <div class="ci-name">${item.name}</div>
            <div class="qty-ctrl">
                <button class="qty-btn" onclick="updateQty('${item.productId}',-1)">−</button>
                <span class="qty-val">${item.qty}</span>
                <button class="qty-btn" onclick="updateQty('${item.productId}',1)">+</button>
            </div>
            <div class="ci-price">₹${(item.price*item.qty).toFixed(2)}</div>
            <button class="ci-del" onclick="removeFromCart('${item.productId}')">✕</button>
        </div>`).join('');
    let subtotal=0, gst=0;
    cart.forEach(i=>{const t=i.price*i.qty; subtotal+=t; gst+=t*i.gstRate/100;});
    if (summary) {
        summary.style.display='block';
        document.getElementById('billSubtotal').textContent=`₹${subtotal.toFixed(2)}`;
        document.getElementById('billCgst').textContent=`₹${(gst/2).toFixed(2)}`;
        document.getElementById('billSgst').textContent=`₹${(gst/2).toFixed(2)}`;
        document.getElementById('billTotal').textContent=`₹${(subtotal+gst).toFixed(2)}`;
    }
}
 
async function createBill() {
    if (cart.length===0) { showToast('Cart empty!','error'); return; }
    const customerName=document.getElementById('billCustomerName').value.trim()||'Walk-in Customer';
    const paymentMode=document.getElementById('billPayMode').value;
    try {
        const res = await fetch(`${API}/billing/create`,{method:'POST',headers:{'Content-Type':'application/json'},
            body:JSON.stringify({customerName,paymentMode,items:cart.map(i=>({productId:i.productId,qty:i.qty}))})});
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        showToast(`Bill created! ₹${data.grandTotal?.toFixed(2)} ✅`);
        cart=[]; renderCart();
    } catch(err) { showToast('Bill create nahi hua: '+err.message,'error'); }
}
 
// ── 4. CUSTOMERS ──
async function renderCustomers() {
    document.getElementById('content-area').innerHTML = `
        <style>
            .customer-card { background: var(--bg-card, #ffffff); border: 1px solid var(--border-color, #e5e7eb); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            .cust-table { width: 100%; border-collapse: collapse; color: var(--text-main, #1f2937); }
            .cust-table th { background: var(--tab-hover, #f9fafb); padding: 16px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border-color); }
            .cust-table td { padding: 16px; border-bottom: 1px solid var(--border-color); }
        </style>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:28px;">
            <div>
                <h1 style="margin:0; font-size:28px; color:var(--text-main);">Customers</h1>
                <p style="color:var(--text-muted, #6b7280); margin-top:4px;">View and manage your client base.</p>
            </div>
            <button style="background:#3b82f6; color:#fff; border:none; padding:12px 20px; border-radius:8px; cursor:pointer; font-weight:600;" 
                    onclick="openModal('customerModal')">+ Add Customer</button>
        </div>

        <div class="customer-card">
            <table class="cust-table">
                <thead>
                    <tr><th>Name</th><th>Phone</th><th>Email</th><th>Total Spent</th><th style="text-align:right;">Action</th></tr>
                </thead>
                <tbody id="customerTableBody">
                    <tr><td colspan="5" style="text-align:center;padding:40px; color:var(--text-muted);">Loading customers...</td></tr>
                </tbody>
            </table>
        </div>`;
    await loadCustomers();
}
 
async function loadCustomers() {
    try {
        const customers = await fetch(`${API}/customers`).then(r=>r.json());
        window.allCustomersData = customers; // Saving data for profile view
        
        const tbody = document.getElementById('customerTableBody');
        if (!tbody) return;
        tbody.innerHTML = customers.length===0 ? `<tr><td colspan="5" style="text-align:center;padding:24px;color:#9ca3af">No customers yet</td></tr>`
            : customers.map(c=>`<tr style="border-bottom:1px solid #f3f4f6;">
                <td style="padding:15px;"><b>${c.name}</b></td><td style="padding:15px; color:#6b7280;">${c.phone||'-'}</td><td style="padding:15px; color:#6b7280;">${c.email||'-'}</td>
                <td style="padding:15px; color:#10b981;"><b>₹${c.totalSpent?.toFixed(2)||'0.00'}</b></td>
                <td style="padding:15px; text-align:right;">
                    <button style="background:#6366f1; color:#fff; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; margin-right:8px;" onclick="viewCustomerProfile('${c.id}')">👤 Profile</button>
                    <button style="background:#ef4444; color:#fff; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;" onclick="deleteCustomer('${c.id}')">🗑️ Delete</button>
                </td></tr>`).join('');
    } catch { showToast('Customers load nahi hue','error'); }
}

function viewCustomerProfile(id) {
    const customer = window.allCustomersData?.find(c => c.id === id) || { name:'Unknown', phone:'-', email:'-', totalSpent:0 };
    const initial = customer.name[0]?.toUpperCase() || 'U';
    
    document.getElementById('content-area').innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
            <div>
                <h1 style="margin:0; font-size:24px; color:var(--text-main);">Customer Profile</h1>
            </div>
            <button style="background:var(--tab-hover, #e5e7eb); color:var(--text-main); border:none; padding:8px 16px; border-radius:6px; cursor:pointer;" 
                    onclick="renderCustomers()">⬅ Back to List</button>
        </div>
        
        <div style="display: grid; grid-template-columns: 350px 1fr; gap: 24px;">
            <!-- Profile Sidebar -->
            <div style="background:var(--bg-card); padding:24px; border-radius:12px; border:1px solid var(--border-color); text-align:center;">
                <div style="width:100px; height:100px; background:#3b82f6; color:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:40px; font-weight:bold; margin:0 auto 20px;">${initial}</div>
                <h2 style="margin:0 0 5px 0; color:var(--text-main);">${customer.name}</h2>
                <div style="color:var(--text-muted); font-size:14px; margin-bottom:20px;">Customer since 2026</div>
                <div style="text-align:left; border-top:1px solid var(--border-color); padding-top:20px;">
                    <p style="font-size:12px; color:var(--text-muted); margin:0;">📱 Phone</p>
                    <b style="color:var(--text-main); margin-bottom:15px; display:block;">${customer.phone || 'N/A'}</b>
                    <p style="font-size:12px; color:var(--text-muted); margin:0;">✉️ Email</p>
                    <b style="color:var(--text-main);">${customer.email || 'N/A'}</b>
                </div>
            </div>

            <!-- Stats Section -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; align-content:start;">
                <div style="background:var(--bg-card); padding:24px; border-radius:12px; border:1px solid var(--border-color); border-left:4px solid #10b981;">
                    <div style="color:var(--text-muted); font-size:14px;">Total Lifetime Value</div>
                    <div style="font-size:28px; font-weight:bold; color:var(--text-main);">₹${customer.totalSpent?.toFixed(2) || '0.00'}</div>
                </div>
                <div style="background:var(--bg-card); padding:24px; border-radius:12px; border:1px solid var(--border-color); border-left:4px solid #f59e0b;">
                    <div style="color:var(--text-muted); font-size:14px;">Customer Status</div>
                    <div style="font-size:24px; font-weight:bold; color:var(--text-main);">${customer.totalSpent > 5000 ? '🌟 Premium' : '⭐ Regular'}</div>
                </div>
            </div>
        </div>
    `;
}
 
/// ── 5. SALES + GST INVOICE ──
async function renderSales() {
    document.getElementById('content-area').innerHTML = `
        <div style="margin-bottom:24px;">
            <h1 style="margin:0; font-size:24px;">Sales History</h1><p style="color:#6b7280; margin-top:4px;">All bills & transactions</p>
        </div>
        <div style="background:#fff; border-radius:8px; box-shadow:0 2px 5px rgba(0,0,0,0.05); overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; text-align:left;">
                <thead>
                    <tr style="background:#f9fafb; color:#374151; font-size:14px;">
                        <th style="padding:15px;">Bill ID</th><th style="padding:15px;">Customer</th><th style="padding:15px;">Items</th>
                        <th style="padding:15px;">Subtotal</th><th style="padding:15px;">GST</th><th style="padding:15px;">Grand Total</th>
                        <th style="padding:15px;">Payment</th><th style="padding:15px; text-align:right;">Invoice</th>
                    </tr>
                </thead>
                <tbody id="salesTableBody"><tr><td colspan="8" style="text-align:center;padding:24px;color:#9ca3af">Loading...</td></tr></tbody>
            </table>
        </div>`;
    try {
        const bills = await fetch(`${API}/billing`).then(r=>r.json());
        const tbody = document.getElementById('salesTableBody');
        tbody.innerHTML = bills.length===0 ? `<tr><td colspan="8" style="text-align:center;padding:24px;color:#9ca3af">No bills yet</td></tr>`
            : bills.reverse().map(b=>`
                <tr style="border-bottom:1px solid #f3f4f6;">
                    <td style="padding:15px; font-family:monospace; color:#6b7280;">${b.id?.slice(-8)}</td>
                    <td style="padding:15px; font-weight:bold;">${b.customerName||'Walk-in'}</td>
                    <td style="padding:15px;">${b.items?.length||0} items</td>
                    <td style="padding:15px;">₹${b.subtotal?.toFixed(2)}</td>
                    <td style="padding:15px;">₹${((b.cgst||0)+(b.sgst||0)).toFixed(2)}</td>
                    <td style="padding:15px; color:#10b981;"><b>₹${b.grandTotal?.toFixed(2)}</b></td>
                    <td style="padding:15px;"><span style="background:#e0f2fe; color:#0369a1; padding:4px 8px; border-radius:4px; font-size:12px;">${b.paymentMode}</span></td>
                    <td style="padding:15px; text-align:right;"><button style="background:#3b82f6; color:#fff; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;" onclick="downloadInvoice('${b.id}')">📄 PDF</button></td>
                </tr>`).join('');
    } catch { showToast('Sales load nahi hua','error'); }
} 
// ── GST INVOICE PDF DOWNLOAD ──
function downloadInvoice(billId) {
    window.open(`${API}/invoice/pdf/${billId}`, '_blank');
}
 
/// ── 6. SETTINGS (WITH TOTAL-SITE GLOBAL THEME PROPAGATION) ──
function renderSettings() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // 1. Full-Site Theme Toggle Engine (Targets Dashboard, Billing, Customers, Sales)
    window.applyGlobalTheme = function(themeName) {
        const root = document.documentElement;
        
        if (themeName === 'dark') {
            // Dark Mode Variables
            root.style.setProperty('--bg-global', '#0f172a');     // Dark Slate background
            root.style.setProperty('--bg-card', '#1e293b');       // Darker card surfaces
            root.style.setProperty('--text-main', '#f8fafc');     // White text
            root.style.setProperty('--text-muted', '#94a3b8');    // Muted grey text
            root.style.setProperty('--border-color', '#334155');  // Dark borders
            root.style.setProperty('--tab-hover', '#334155');     // Dark active tab state
            root.style.setProperty('--input-disabled', '#1e293b');
            
            localStorage.setItem('site-theme', 'dark');
        } else {
            // Light Mode Variables
            root.style.setProperty('--bg-global', '#f8fafc');     // Crisp light background
            root.style.setProperty('--bg-card', '#ffffff');       // Clean white card
            root.style.setProperty('--text-main', '#1f2937');     // Dark charcoal text
            root.style.setProperty('--text-muted', '#6b7280');    // Muted slate text
            root.style.setProperty('--border-color', '#e5e7eb');  // Soft light borders
            root.style.setProperty('--tab-hover', '#f3f4f6');     // Light active tab state
            root.style.setProperty('--input-disabled', '#f9fafb');
            
            localStorage.setItem('site-theme', 'light');
        }
        
        // FORCE THEME OVERRIDE ON OTHER PAGES (Dashboard, Billing, Customers, Sales layouts)
        // This targets common wrapper elements across your whole ERP architecture
        const globalContainers = document.querySelectorAll(
            'body, html, #main-layout, #sidebar, .sidebar, header, nav, #content-area, .dashboard-card, .card, table, th, td'
        );
        
        globalContainers.forEach(el => {
            // Dynamically assign variable fallbacks to components outside settings page
            if (el.tagName === 'TABLE' || el.classList.contains('card') || el.classList.contains('dashboard-card') || el.id === 'sidebar' || el.classList.contains('sidebar')) {
                el.style.backgroundColor = 'var(--bg-card)';
                el.style.borderColor = 'var(--border-color)';
            } else if (el.tagName === 'TH' || el.tagName === 'TD') {
                el.style.color = 'var(--text-main)';
                el.style.borderColor = 'var(--border-color)';
            } else {
                el.style.backgroundColor = 'var(--bg-global)';
            }
            el.style.color = 'var(--text-main)';
        });

        // Update the active card ring indicator inside the settings tab view
        document.querySelectorAll('.theme-card').forEach(card => card.style.borderColor = 'var(--border-color)');
        if (event && event.currentTarget) {
            event.currentTarget.style.borderColor = '#3b82f6';
        }
        
        showToast(`${themeName.toUpperCase()} theme applied to all modules! 🌓`);
    };

    // 2. Tab Switching Engine
    window.switchSettingsTab = function(tabName, element) {
        const contents = document.querySelectorAll('.settings-tab-content');
        contents.forEach(content => content.style.display = 'none');
        
        document.getElementById(`tab-content-${tabName}`).style.display = 'block';
        
        const buttons = document.querySelectorAll('.settings-tab-btn');
        buttons.forEach(btn => {
            btn.style.background = 'transparent';
            btn.style.color = 'var(--text-muted)';
            btn.style.fontWeight = '400';
        });
        
        element.style.background = 'var(--tab-hover)';
        element.style.color = 'var(--text-main)';
        element.style.fontWeight = '600';
    };

    const currentTheme = localStorage.getItem('site-theme') || 'light';

    document.getElementById('content-area').innerHTML = `
        <style>
            /* STYLES FOR THE SETTINGS PANEL WINDOW */
            .settings-container { color: var(--text-main); font-family: 'Inter', system-ui, sans-serif; }
            .settings-card {
                background: var(--bg-card) !important;
                border: 1px solid var(--border-color) !important;
                color: var(--text-main) !important;
                transition: background 0.2s ease, border-color 0.2s ease;
            }
            .settings-container input[type="text"], 
            .settings-container input[type="email"],
            .settings-container input[type="password"] {
                background: var(--bg-card);
                color: var(--text-main);
                border: 1px solid var(--border-color);
                transition: all 0.2s ease;
            }
            .settings-container input[type="text"]:focus, 
            .settings-container input[type="email"]:focus,
            .settings-container input[type="password"]:focus {
                border-color: #3b82f6 !important;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2) !important;
                outline: none;
            }
            .settings-btn { transition: transform 0.1s ease, filter 0.2s ease; }
            .settings-btn:hover { filter: brightness(95%); }
            .settings-btn:active { transform: scale(0.98); }

            .settings-tab-btn {
                display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px 16px;
                border: none; border-radius: 8px; text-align: left; font-size: 14px; cursor: pointer;
                color: var(--text-muted); background: transparent; transition: all 0.2s ease;
            }
            .settings-tab-btn:hover { background: var(--tab-hover); color: var(--text-main); }
            
            .theme-card {
                border: 2px solid var(--border-color); border-radius: 8px; padding: 14px; cursor: pointer;
                display: flex; align-items: center; gap: 12px; transition: all 0.2s; background: var(--bg-card);
            }
        </style>

        <div class="settings-container" style="max-width: 1000px; margin: 0 auto; padding: 12px;">
            <div style="margin-bottom: 28px;">
                <h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">System Settings</h1>
                <p style="color: var(--text-muted); margin: 6px 0 0 0; font-size: 14px;">Manage system modules, toggle full dark/light presentation layers, and user profiles.</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 240px 1fr; gap: 32px; align-items: start;">
                <div class="settings-card" style="display: flex; flex-direction: column; gap: 6px; padding: 16px; border-radius: 12px;">
                    <button class="settings-tab-btn" style="background: var(--tab-hover); color: var(--text-main); font-weight: 600;" onclick="switchSettingsTab('profile', this)">
                        👤 Profile Info
                    </button>
                    <button class="settings-tab-btn" onclick="switchSettingsTab('password', this)">
                        🔒 Security & Password
                    </button>
                   
                    <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 12px 0;">
                    <button class="settings-btn" style="background: #fff5f5; color: #ef4444; border: 1px solid #fee2e2; padding: 10px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="handleLogout()">
                        🚪 Logout Now
                    </button>
                </div>
                
                <div class="settings-card" style="padding: 32px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); min-height: 360px;">
                    
                    <div id="tab-content-profile" class="settings-tab-content">
                        <h3 style="margin-top: 0; margin-bottom: 6px; font-size: 20px; font-weight: 600;">Profile Information</h3>
                        <p style="color: var(--text-muted); font-size: 13px; margin: 0 0 24px 0;">Update dashboard administrative usernames and data accounts.</p>
                        <div style="margin-bottom: 18px;">
                            <label style="display: block; font-size: 13px; font-weight: 500; color: var(--text-muted); margin-bottom: 6px;">Admin Name</label>
                            <input type="text" value="${user.name || 'Admin'}" style="width: 100%; padding: 11px 14px; border-radius: 8px; font-size: 14px; box-sizing: border-box;">
                        </div>
                        <div style="margin-bottom: 18px;">
                            <label style="display: block; font-size: 13px; font-weight: 500; color: var(--text-muted); margin-bottom: 6px;">Email Address</label>
                            <input type="email" value="${user.email || ''}" style="width: 100%; padding: 11px 14px; border-radius: 8px; font-size: 14px; box-sizing: border-box;">
                        </div>
                        <button class="settings-btn" style="background: #3b82f6; color: #fff; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;" onclick="showToast('Profile updated! ✅')">Update Profile</button>
                    </div>

                    <div id="tab-content-password" class="settings-tab-content" style="display: none;">
                        <h3 style="margin-top: 0; margin-bottom: 6px; font-size: 20px; font-weight: 600;">Security Settings</h3>
                        <p style="color: var(--text-muted); font-size: 13px; margin: 0 0 24px 0;">Keep credentials encrypted and changed frequently.</p>
                        <div style="margin-bottom: 18px;">
                            <label style="display: block; font-size: 13px; font-weight: 500; color: var(--text-muted); margin-bottom: 6px;">Current Password</label>
                            <input type="password" placeholder="••••••••" style="width: 100%; padding: 11px 14px; border-radius: 8px; font-size: 14px; box-sizing: border-box;">
                        </div>
                        <div style="margin-bottom: 24px;">
                            <label style="display: block; font-size: 13px; font-weight: 500; color: var(--text-muted); margin-bottom: 6px;">New Password</label>
                            <input type="password" placeholder="Minimum 8 characters" style="width: 100%; padding: 11px 14px; border-radius: 8px; font-size: 14px; box-sizing: border-box;">
                        </div>
                        <button class="settings-btn" style="background: #4f46e5; color: #fff; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;" onclick="showToast('Password updated successfully! 🔑')">Update Password</button>
                    </div>

                    <div id="tab-content-themes" class="settings-tab-content" style="display: none;">
                        <h3 style="margin-top: 0; margin-bottom: 6px; font-size: 20px; font-weight: 600;">Website Display Theme</h3>
                        <p style="color: var(--text-muted); font-size: 13px; margin: 0 0 24px 0;">Flipping this setting applies color adjustments across Dashboard, Billing, Customers, and Sales pages.</p>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                            <div class="theme-card" style="${currentTheme === 'light' ? 'border-color: #3b82f6;' : ''}" onclick="applyGlobalTheme('light')">
                                <div style="width: 24px; height: 24px; border-radius: 50%; background: #ffffff; border: 2px solid #cbd5e1; display:flex; align-items:center; justify-content:center; font-size:12px;">☀️</div>
                                <div>
                                    <h4 style="margin: 0; font-size: 14px; font-weight: 600;">Light Mode</h4>
                                    <p style="margin: 2px 0 0 0; font-size: 11px; color: var(--text-muted);">Applies to all ERP sub-menus</p>
                                </div>
                            </div>
                            <div class="theme-card" style="${currentTheme === 'dark' ? 'border-color: #3b82f6;' : ''}" onclick="applyGlobalTheme('dark')">
                                <div style="width: 24px; height: 24px; border-radius: 50%; background: #0f172a; border: 2px solid #334155; display:flex; align-items:center; justify-content:center; font-size:12px;">🌙</div>
                                <div>
                                    <h4 style="margin: 0; font-size: 14px; font-weight: 600;">Dark Mode</h4>
                                    <p style="margin: 2px 0 0 0; font-size: 11px; color: var(--text-muted);">Applies to all ERP sub-menus</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>`;
}