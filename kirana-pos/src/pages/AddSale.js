import { renderLayout } from "../components/Layout";
import { getAllStock, saveSale, processSale, getShopSettings } from "../services/db";
import { showToast } from "../utils/toast";
import { t } from "../i18n/i18n";
import { navigate } from "../app";
import { evaluateCreditDecision } from "../services/creditAdvisor";
import { logAudit } from "../services/auditLog";

export async function renderAddSale() {
  const stock = await getAllStock();
  const shopSettings = await getShopSettings();
  const shopId = shopSettings?.backendShopId;

  let cartItems = [];
  let saleMode = "amount"; // "amount" or "items"
  let selectedPayment = "cash";

  const app = document.getElementById("app");

  const content = `
    <section class="add-sale">
      <div class="page-header">
        <h1>Add New Sale</h1>
        <p class="page-subtitle">Process transactions and update inventory</p>
      </div>

      <div class="sale-form-container glass-card">
        
        <div class="mode-tabs">
          <button id="mode-amount" class="tab-btn active">Quick Amount</button>
          <button id="mode-items" class="tab-btn">Itemized Sale</button>
        </div>

        <form id="sale-form">
          
          <!-- QUICK AMOUNT SECTION -->
          <div id="amount-section" class="form-section">
            <div class="input-group">
              <label>Amount (₹)</label>
              <input id="amount" type="number" step="0.01" placeholder="0.00" autofocus />
            </div>
          </div>

          <!-- ITEM SALE SECTION -->
          <div id="item-sale-section" class="form-section" style="display:none">
            <div class="input-group">
              <label>Search Product</label>
              <input id="stock-search" placeholder="Type name or scan barcode..." autocomplete="off" />
              <div id="search-results" class="search-results"></div>
            </div>

            <div class="cart-preview">
              <h3>Cart Items</h3>
              <div id="cart-list" class="cart-list">
                <p class="empty-text">No items added</p>
              </div>
              <div class="cart-total-row">
                <span>Total Amount:</span>
                <span id="cart-total">₹0</span>
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <!-- PAYMENT SECTION -->
          <div class="form-section">
            <label>Payment Method</label>
            <div class="payment-selector">
              <button type="button" class="pay-btn active" data-method="cash">Cash</button>
              <button type="button" class="pay-btn" data-method="upi">UPI</button>
              <button type="button" class="pay-btn" data-method="credit">Credit</button>
            </div>
          </div>

          <!-- CUSTOMER SECTION -->
          <div class="form-section">
            <div class="input-group">
              <label>Customer Name</label>
              <input id="customer" placeholder="Enter name (Optional)" />
            </div>
            <div class="input-group">
              <label>Mobile Number</label>
              <input id="customer-phone" type="tel" placeholder="Enter phone" />
            </div>
            <div id="credit-advice" class="credit-advice-box"></div>
          </div>

          <button type="submit" class="btn-primary-formal full-width">Finalize Sale</button>
        </form>
      </div>
    </section>

    <style>
      .add-sale { max-width: 600px; margin: 0 auto; }
      .sale-form-container { padding: 32px; margin-top: 24px; }
      
      .mode-tabs { display: flex; gap: 8px; margin-bottom: 32px; background: rgba(0,0,0,0.2); padding: 4px; border-radius: 12px; }
      .tab-btn { flex: 1; padding: 10px; border: none; background: transparent; color: #64748b; font-weight: 600; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
      .tab-btn.active { background: #22c55e; color: #fff; }

      .form-section { margin-bottom: 24px; }
      .divider { height: 1px; background: rgba(255,255,255,0.08); margin: 32px 0; }

      .input-group label { display: block; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
      .input-group input { width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; font-size: 14px; }
      .input-group input:focus { border-color: #22c55e; outline: none; background: rgba(255,255,255,0.08); }

      .payment-selector { display: flex; gap: 8px; }
      .pay-btn { flex: 1; padding: 12px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); color: #94a3b8; border-radius: 10px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
      .pay-btn.active { background: #22c55e; color: #fff; border-color: #22c55e; }

      .cart-preview { margin-top: 24px; background: rgba(0,0,0,0.1); padding: 16px; border-radius: 12px; }
      .cart-preview h3 { font-size: 13px; color: #fff; margin-bottom: 12px; }
      .cart-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; }
      .cart-total-row { display: flex; justify-content: space-between; margin-top: 16px; padding-top: 12px; border-top: 2px solid rgba(255,255,255,0.1); font-weight: 700; color: #fff; font-size: 15px; }

      .search-results { position: relative; }
      .search-dropdown { position: absolute; top: 4px; left: 0; right: 0; background: #1a2235; border: 1px solid #22c55e; border-radius: 12px; z-index: 100; max-height: 200px; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
      .search-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); }
      .search-item:hover { background: rgba(255,255,255,0.05); }
      .search-item strong { color: #fff; font-size: 13px; }
      .search-item small { color: #64748b; display: block; font-size: 11px; }
      .search-item button { padding: 4px 10px; background: #22c55e; border: none; border-radius: 6px; color: #fff; font-size: 11px; font-weight: 700; cursor: pointer; }

      .btn-primary-formal { background: #22c55e; color: #fff; border: none; padding: 16px; border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer; transition: all 0.2s; margin-top: 12px; }
      .btn-primary-formal:hover { transform: translateY(-2px); opacity: 0.9; }

      .credit-advice-box { margin-top: 12px; padding: 12px; border-radius: 10px; display: none; font-size: 12px; line-height: 1.5; }
      .credit-advice-box.safe { display: block; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2); color: #22c55e; }
      .credit-advice-box.risky { display: block; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #ef4444; }
    </style>
  `;

  document.querySelector(".main-content").innerHTML = content;

  // Form Elements
  const amountSection = document.getElementById("amount-section");
  const itemSection   = document.getElementById("item-sale-section");
  const cartDiv       = document.getElementById("cart-list");
  const cartTotal     = document.getElementById("cart-total");
  const amountInput   = document.getElementById("amount");
  const customerInput = document.getElementById("customer");
  const phoneInput    = document.getElementById("customer-phone");
  const adviceBox     = document.getElementById("credit-advice");

  // Tabs
  document.getElementById("mode-amount").onclick = (e) => {
    saleMode = "amount";
    e.target.classList.add("active");
    document.getElementById("mode-items").classList.remove("active");
    amountSection.style.display = "block";
    itemSection.style.display = "none";
    renderCart();
  };

  document.getElementById("mode-items").onclick = (e) => {
    saleMode = "items";
    e.target.classList.add("active");
    document.getElementById("mode-amount").classList.remove("active");
    amountSection.style.display = "none";
    itemSection.style.display = "block";
    renderCart();
  };

  // Payment Selection
  document.querySelectorAll(".pay-btn").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".pay-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedPayment = btn.dataset.method;
      runCreditAdvisor();
    };
  });

  // Stock Search
  const searchInput = document.getElementById("stock-search");
  const resultsDiv = document.getElementById("search-results");

  searchInput.oninput = () => {
    const q = searchInput.value.toLowerCase().trim();
    if (!q) return (resultsDiv.innerHTML = "");

    const results = stock.filter(s => s.name.toLowerCase().includes(q)).slice(0, 5);
    resultsDiv.innerHTML = `
      <div class="search-dropdown">
        ${results.map(i => `
          <div class="search-item">
            <div>
              <strong>${i.name}</strong>
              <small>₹${i.price} • Stock: ${i.quantity}</small>
            </div>
            <button data-id="${i.id}">Add</button>
          </div>
        `).join("")}
      </div>
    `;

    resultsDiv.querySelectorAll("button").forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const item = stock.find(s => s.id === id);
        const existing = cartItems.find(c => c.itemId === id);
        if (existing) existing.qty++;
        else cartItems.push({ itemId: id, name: item.name, price: item.price, qty: 1 });
        renderCart();
        searchInput.value = "";
        resultsDiv.innerHTML = "";
      };
    });
  };

  function renderCart() {
    if (cartItems.length === 0) {
      cartDiv.innerHTML = `<p class="empty-text">No items added</p>`;
      cartTotal.textContent = "₹0";
    } else {
      let total = 0;
      cartDiv.innerHTML = cartItems.map(i => {
        total += i.price * i.qty;
        return `
          <div class="cart-row">
            <span>${i.name} × ${i.qty}</span>
            <span>₹${(i.price * i.qty).toFixed(2)}</span>
          </div>
        `;
      }).join("");
      cartTotal.textContent = `₹${total.toFixed(2)}`;
    }
    runCreditAdvisor();
  }

  async function runCreditAdvisor() {
    const phone = phoneInput.value.trim();
    if (!phone || selectedPayment !== "credit") {
      adviceBox.style.display = "none";
      return;
    }
    const amount = saleMode === "amount" ? parseFloat(amountInput.value) : cartItems.reduce((s, i) => s + i.price * i.qty, 0);
    if (!amount) return;

    adviceBox.style.display = "block";
    adviceBox.textContent = "Analyzing credit...";

    const { evaluateCreditDecision } = await import("../services/creditAdvisor.js");
    const advice = await evaluateCreditDecision(customerInput.value.trim() || phone, amount);
    adviceBox.className = `credit-advice-box ${advice.level === 'risky' ? 'risky' : 'safe'}`;
    adviceBox.innerHTML = `<strong>${advice.message}</strong><br><small>Safe Limit: ₹${advice.safeLimit}</small>`;
  }

  amountInput.oninput = runCreditAdvisor;
  phoneInput.oninput = runCreditAdvisor;
  customerInput.oninput = runCreditAdvisor;

  // Submit
  document.getElementById("sale-form").onsubmit = async (e) => {
    e.preventDefault();
    const amount = saleMode === "amount" ? parseFloat(amountInput.value) : cartItems.reduce((s, i) => s + i.price * i.qty, 0);
    
    if (!amount || amount <= 0) {
      showToast("Enter a valid amount", "error");
      return;
    }

    const customerName = customerInput.value.trim();
    const customerPhone = phoneInput.value.trim();

    let customer = null;
    if (customerName || customerPhone) {
      const { resolveCustomerIdentity } = await import("../services/customerIdentityService.js");
      customer = await resolveCustomerIdentity({ name: customerName, phone: customerPhone });
    }

    const sale = {
      id: crypto.randomUUID(),
      amount,
      paymentMethod: selectedPayment,
      accountType: saleMode === "amount" ? "QUICK_SALE" : "ITEM_SALE",
      customerName: customerName || "Walk-in",
      customerPhone,
      items: cartItems,
      date: new Date().toLocaleDateString(),
      timestamp: Date.now()
    };

    if (saleMode === "items") await processSale(sale);
    else await saveSale(sale);

    // Loyalty
    if (customer?.id) {
      const { updateCustomerLoyalty } = await import("../services/loyaltyEngine.js");
      await updateCustomerLoyalty(customer.id, amount);

      if (shopId) {
        const { linkCustomerToShop, updateCustomerShopStats } = await import("../services/customerShopService.js");
        await linkCustomerToShop(customer.id, shopId);
        await updateCustomerShopStats({ customerId: customer.id, shopId, amount });
      }
    }

    showToast("Sale completed!", "success");
    navigate("dashboard");
  };
}
