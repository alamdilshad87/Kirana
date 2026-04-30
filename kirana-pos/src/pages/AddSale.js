import { renderLayout } from "../components/Layout";
import { getAllStock, saveSale, processSale, getShopSettings } from "../services/db";
import { showToast } from "../utils/toast";
import { t } from "../i18n/i18n";
import { navigate } from "../app";

export async function renderAddSale() {
  const stock = await getAllStock();
  const shopSettings = await getShopSettings();
  const shopId = shopSettings?.backendShopId;

  let cartItems = [];
  let saleMode = "items"; 
  let selectedPayment = "cash";

  const content = `
    <section class="add-transaction-page">
      <div class="transaction-container glass-card">
        <h1 class="transaction-title">Add Transaction</h1>

        <div class="transaction-tabs">
          <button id="tab-quick" class="trans-tab">Quick Sale</button>
          <button id="tab-item" class="trans-tab active">Item Sale</button>
        </div>

        <div class="transaction-body">
          
          <div id="quick-sale-wrap" style="display:none">
             <p class="section-label">Enter Amount (₹)</p>
             <input id="quick-amount" type="number" placeholder="0.00" class="main-input" autofocus />
          </div>

          <div id="item-sale-wrap">
            <p class="section-label">Search Item</p>
            <div class="search-input-wrap">
              <input id="item-search" type="text" placeholder="Type name or scan..." autocomplete="off" class="main-input" />
              <div id="search-results" class="search-results-overlay"></div>
            </div>

            <div class="cart-container-new">
              <p class="section-label">Current Cart</p>
              <div id="cart-list-new" class="cart-scroll-area">
                <p class="empty-msg">No items added</p>
              </div>
              <div class="cart-footer-total">
                <span>Total Amount:</span>
                <span class="total-big">₹<span id="total-val">0</span></span>
              </div>
            </div>
          </div>

          <div class="payment-method-grid">
            <p class="section-label" style="grid-column: span 2">Payment Method</p>
            <button class="pay-chip active" data-method="cash">💵 Cash</button>
            <button class="pay-chip" data-method="upi">📱 UPI</button>
            <button class="pay-chip full-span" data-method="credit">💳 Credit / Udhaar</button>
          </div>

          <div class="customer-info-fields">
             <div class="field-half">
                <p class="section-label">Customer Name</p>
                <input id="cust-name" type="text" placeholder="Optional" class="small-input" />
             </div>
             <div class="field-half">
                <p class="section-label">Mobile Number</p>
                <input id="cust-phone" type="tel" placeholder="Optional" class="small-input" />
             </div>
          </div>

          <button id="finalize-btn" class="save-primary-btn">Finalize Transaction</button>
        </div>
      </div>
    </section>

    <style>
      .add-transaction-page { display: flex; justify-content: center; padding: 40px 20px; }
      .transaction-container {
        width: 100%;
        max-width: 500px;
        background: rgba(15, 23, 42, 0.45);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 24px;
        padding: 32px;
        backdrop-filter: blur(25px);
        box-shadow: 0 40px 100px rgba(0,0,0,0.5);
      }
      .transaction-title { font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 24px; text-align: center; }
      
      .transaction-tabs { display: flex; gap: 8px; margin-bottom: 32px; background: rgba(255,255,255,0.04); padding: 4px; border-radius: 14px; }
      .trans-tab {
        flex: 1; padding: 10px; border-radius: 11px; border: none; background: transparent;
        color: #94a3b8; font-size: 13px; font-weight: 700; cursor: pointer; transition: 0.2s;
      }
      .trans-tab.active { background: #22c55e; color: #fff; box-shadow: 0 4px 12px rgba(34,197,94,0.3); }

      .section-label { font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
      
      .main-input {
        width: 100%; padding: 14px 18px; background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; color: #fff;
        font-size: 15px; margin-bottom: 24px; outline: none; transition: 0.2s;
      }
      .main-input:focus { border-color: #22c55e; background: rgba(255,255,255,0.08); }

      .search-input-wrap { position: relative; }
      .search-results-overlay {
        position: absolute; top: 54px; left: 0; right: 0; background: #111827;
        border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; z-index: 100;
        max-height: 200px; overflow-y: auto; box-shadow: 0 20px 40px rgba(0,0,0,0.6);
      }
      .search-item-row {
        padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.05);
        display: flex; justify-content: space-between; align-items: center; cursor: pointer;
      }
      .search-item-row:hover { background: rgba(255,255,255,0.05); }
      .search-item-row strong { color: #fff; font-size: 14px; }
      .search-item-row small { color: #64748b; font-size: 12px; }

      .cart-container-new { background: rgba(0,0,0,0.2); border-radius: 16px; padding: 20px; margin-bottom: 24px; }
      .cart-scroll-area { max-height: 160px; overflow-y: auto; margin-bottom: 16px; }
      .cart-item-new {
        display: flex; justify-content: space-between; align-items: center;
        padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
      }
      .cart-item-new span { font-size: 14px; color: #e2e8f0; }
      .cart-item-new button { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; border-radius: 6px; padding: 4px 8px; font-size: 10px; cursor: pointer; }
      
      .cart-footer-total { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); }
      .cart-footer-total span { font-size: 14px; color: #94a3b8; }
      .total-big { font-size: 20px !important; font-weight: 800; color: #fff !important; }

      .payment-method-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
      .pay-chip {
        padding: 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px; color: #94a3b8; font-weight: 700; font-size: 13px; cursor: pointer; transition: 0.2s;
      }
      .pay-chip.active { border-color: #3b82f6; color: #fff; background: rgba(59,130,246,0.15); }
      .full-span { grid-column: span 2; }

      .customer-info-fields { display: flex; gap: 16px; margin-bottom: 32px; }
      .field-half { flex: 1; }
      .small-input {
        width: 100%; padding: 12px 14px; background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; color: #fff; font-size: 13px; outline: none;
      }

      .save-primary-btn {
        width: 100%; padding: 18px; background: #22c55e; color: #fff; border: none;
        border-radius: 14px; font-weight: 800; font-size: 16px; cursor: pointer;
        box-shadow: 0 10px 20px rgba(34,197,94,0.3); transition: 0.2s;
      }
      .save-primary-btn:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(34,197,94,0.4); }
      .empty-msg { font-size: 13px; color: #475569; font-style: italic; }
    </style>
  `;

  document.querySelector(".main-content").innerHTML = content;

  // Cache elements
  const tabQuick = document.getElementById("tab-quick");
  const tabItem = document.getElementById("tab-item");
  const quickWrap = document.getElementById("quick-sale-wrap");
  const itemWrap = document.getElementById("item-sale-wrap");
  const searchInput = document.getElementById("item-search");
  const amountInput = document.getElementById("quick-amount");
  const resultsDiv = document.getElementById("search-results");
  const cartList = document.getElementById("cart-list-new");
  const totalVal = document.getElementById("total-val");
  const finalizeBtn = document.getElementById("finalize-btn");

  // Tab switching
  tabQuick.onclick = () => {
    saleMode = "amount";
    tabQuick.classList.add("active");
    tabItem.classList.remove("active");
    quickWrap.style.display = "block";
    itemWrap.style.display = "none";
    updateTotal();
  };
  tabItem.onclick = () => {
    saleMode = "items";
    tabItem.classList.add("active");
    tabQuick.classList.remove("active");
    quickWrap.style.display = "none";
    itemWrap.style.display = "block";
    updateTotal();
  };

  // Payment Selection
  document.querySelectorAll(".pay-chip").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".pay-chip").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedPayment = btn.dataset.method;
    };
  });

  // Search Logic
  searchInput.oninput = () => {
    const q = searchInput.value.toLowerCase().trim();
    if (!q) return (resultsDiv.innerHTML = "");

    const matches = stock.filter(s => s.name.toLowerCase().includes(q)).slice(0, 6);
    resultsDiv.innerHTML = matches.length ? matches.map(m => `
      <div class="search-item-row" data-id="${m.id}">
        <div>
          <strong>${m.name}</strong><br/>
          <small>Stock: ${m.quantity} • ₹${m.price}</small>
        </div>
        <span style="color:#22c55e;font-weight:700">Add +</span>
      </div>
    `).join("") : `<div class="search-item-row"><span>No items found</span></div>`;

    resultsDiv.querySelectorAll(".search-item-row").forEach(row => {
      row.onclick = () => {
        const id = row.dataset.id;
        if (!id) return;
        const s = stock.find(x => x.id === id);
        const existing = cartItems.find(c => c.itemId === id);
        if (existing) existing.qty++;
        else cartItems.push({ itemId: id, name: s.name, price: s.price, qty: 1 });
        
        renderCart();
        searchInput.value = "";
        resultsDiv.innerHTML = "";
      };
    });
  };

  amountInput.oninput = () => updateTotal();

  function renderCart() {
    if (cartItems.length === 0) {
      cartList.innerHTML = `<p class="empty-msg">No items added</p>`;
    } else {
      cartList.innerHTML = cartItems.map((i, idx) => `
        <div class="cart-item-new">
          <span>${i.name} <strong>x${i.qty}</strong></span>
          <div>
            <span style="margin-right:12px">₹${i.price * i.qty}</span>
            <button data-idx="${idx}">Remove</button>
          </div>
        </div>
      `).join("");

      cartList.querySelectorAll("button").forEach(btn => {
        btn.onclick = () => {
          cartItems.splice(parseInt(btn.dataset.idx), 1);
          renderCart();
        };
      });
    }
    updateTotal();
  }

  function updateTotal() {
    let total = 0;
    if (saleMode === "amount") {
      total = parseFloat(amountInput.value) || 0;
    } else {
      total = cartItems.reduce((s, i) => s + (i.price * i.qty), 0);
    }
    totalVal.textContent = total.toFixed(2);
  }

  // Finalize
  finalizeBtn.onclick = async () => {
    const amount = parseFloat(totalVal.textContent);
    if (!amount || amount <= 0) {
       showToast("Enter a valid amount", "error");
       return;
    }

    finalizeBtn.disabled = true;
    finalizeBtn.textContent = "Processing...";

    const name = document.getElementById("cust-name").value.trim();
    const phone = document.getElementById("cust-phone").value.trim();

    const sale = {
      id: crypto.randomUUID(),
      amount,
      paymentMethod: selectedPayment,
      accountType: saleMode === "amount" ? "QUICK_SALE" : "ITEM_SALE",
      customerName: name || "Walk-in",
      customerPhone: phone,
      items: cartItems,
      date: new Date().toLocaleDateString(),
      timestamp: Date.now()
    };

    try {
      if (saleMode === "items") await processSale(sale);
      else await saveSale(sale);

      showToast("Transaction Saved Successfully!", "success");
      navigate("dashboard");
    } catch (err) {
      showToast("Error saving sale", "error");
      finalizeBtn.disabled = false;
      finalizeBtn.textContent = "Finalize Transaction";
    }
  };
}
