import { renderLayout } from "../components/Layout";
import { getAllStock, saveSale, processSale, getShopSettings } from "../services/db";
import { showToast } from "../utils/toast";
import { t } from "../i18n/i18n";
import { navigate } from "../app";
import { openUPIPayment } from "../components/UPIPaymentOverlay";

export async function renderAddSale() {
  const stock = await getAllStock();
  const shopSettings = await getShopSettings();
  const shopId = shopSettings?.backendShopId;

  let cartItems = [];
  let saleMode = "items"; 
  let selectedPayment = "cash";

  const content = `
    <section class="add-sale-pro">
      <div class="pro-card glass-card">
        <div class="pro-card-header">
          <h2>Add Transaction</h2>
          <div class="pro-tabs">
            <button id="p-tab-items" class="p-tab active">Items</button>
            <button id="p-tab-quick" class="p-tab">Quick</button>
          </div>
        </div>

        <div class="pro-card-body">
          <div id="p-item-area">
            <div class="p-search-wrap">
              <input id="p-search" type="text" placeholder="Search product or scan..." autocomplete="off" />
              <div id="p-results" class="p-dropdown"></div>
            </div>

            <div class="p-cart">
              <div id="p-cart-list" class="p-cart-list">
                <div class="p-empty">Cart is empty</div>
              </div>
            </div>
          </div>

          <div id="p-quick-area" style="display:none">
            <input id="p-amount" type="number" placeholder="Enter Amount ₹" class="p-large-input" />
          </div>

          <div class="p-divider"></div>

          <div class="p-footer-grid">
            <div class="p-payment">
              <label>Payment Method</label>
              <div class="p-pay-toggle">
                <button class="p-pay-btn active" data-method="cash">Cash</button>
                <button class="p-pay-btn" data-method="upi">UPI</button>
                <button class="p-pay-btn" data-method="credit">Credit</button>
              </div>
            </div>
            
            <div class="p-customer">
              <label>Customer Name <span class="req">*</span></label>
              <input id="p-cust-name" type="text" placeholder="Required" />
              <label style="margin-top:12px">Mobile Number <span class="req">*</span></label>
              <input id="p-cust-phone" type="tel" placeholder="Required" maxlength="10" />
            </div>
          </div>

          <div class="p-total-bar">
            <span>Total: <strong>₹<span id="p-total">0</span></strong></span>
            <button id="p-save" class="p-save-btn">Finalize Sale</button>
          </div>
        </div>
      </div>
    </section>

    <style>
      .add-sale-pro { display: flex; justify-content: center; padding: 20px; }
      .pro-card { 
        width: 100%; max-width: 480px; 
        background: rgba(10, 15, 30, 0.55); 
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 20px; padding: 24px;
        box-shadow: 0 40px 100px rgba(0,0,0,0.6);
        backdrop-filter: blur(25px);
      }
      
      .pro-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
      .pro-card-header h2 { font-size: 18px; color: #fff; font-weight: 700; margin: 0; }
      
      .pro-tabs { display: flex; background: rgba(255,255,255,0.05); padding: 3px; border-radius: 10px; }
      .p-tab { padding: 6px 14px; border: none; background: transparent; color: #64748b; font-size: 12px; font-weight: 700; cursor: pointer; border-radius: 8px; transition: 0.2s; }
      .p-tab.active { background: #22c55e; color: #fff; }

      .p-search-wrap { position: relative; margin-bottom: 16px; }
      .p-search-wrap input { width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; outline: none; }
      .p-search-wrap input:focus { border-color: #22c55e; }

      .p-dropdown { position: absolute; top: 50px; left: 0; right: 0; background: #111827; border: 1px solid #22c55e; border-radius: 12px; z-index: 100; max-height: 180px; overflow-y: auto; }
      .p-drop-item { display: flex; justify-content: space-between; padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; }
      .p-drop-item:hover { background: rgba(255,255,255,0.05); }
      .p-drop-item strong { color: #fff; font-size: 13px; }
      .p-drop-item small { color: #64748b; font-size: 11px; }

      .p-cart-list { margin-bottom: 20px; max-height: 200px; overflow-y: auto; scrollbar-width: none; }
      .p-cart-list::-webkit-scrollbar { display: none; }
      .p-empty { text-align: center; color: #475569; font-size: 13px; padding: 10px; }
      .p-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
      .p-item-info { flex: 1; }
      .p-item-info div { color: #fff; font-size: 14px; font-weight: 500; }
      .p-item-info small { color: #64748b; font-size: 11px; }
      
      .p-qty { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 8px; }
      .p-qty button { width: 24px; height: 24px; border: none; background: rgba(255,255,255,0.1); color: #fff; border-radius: 4px; cursor: pointer; font-weight: 800; }
      .p-qty span { font-size: 13px; color: #fff; min-width: 20px; text-align: center; }

      .p-large-input { width: 100%; padding: 20px; font-size: 24px; font-weight: 800; text-align: center; background: transparent; border: 2px dashed rgba(255,255,255,0.1); border-radius: 16px; color: #22c55e; margin-bottom: 20px; }
      
      .p-divider { height: 1px; background: rgba(255,255,255,0.05); margin-bottom: 20px; }

      .p-footer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
      .p-footer-grid label { display: block; font-size: 10px; font-weight: 800; color: #475569; text-transform: uppercase; margin-bottom: 6px; }
      .p-footer-grid input { width: 100%; padding: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 13px; outline: none; }
      .p-footer-grid input:focus { border-color: #22c55e; }
      .req { color: #ef4444; margin-left: 2px; }

      .p-pay-toggle { display: flex; flex-direction: column; gap: 6px; }
      .p-pay-btn { width: 100%; padding: 10px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02); color: #64748b; font-size: 12px; font-weight: 700; cursor: pointer; border-radius: 8px; text-align: left; transition: 0.2s; }
      .p-pay-btn.active { background: rgba(34,197,94,0.1); color: #22c55e; border-color: #22c55e33; }

      .p-total-bar { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: rgba(34,197,94,0.1); border-radius: 16px; border: 1px solid rgba(34,197,94,0.2); }
      .p-total-bar span { color: #fff; font-size: 14px; }
      .p-total-bar strong { color: #22c55e; font-size: 20px; margin-left: 4px; }
      .p-save-btn { padding: 10px 24px; background: #22c55e; color: #fff; border: none; border-radius: 10px; font-weight: 800; font-size: 14px; cursor: pointer; transition: 0.2s; }
      .p-save-btn:hover { transform: scale(1.05); }
    </style>
  `;

  document.querySelector(".main-content").innerHTML = content;

  // Tabs
  const tabItems = document.getElementById("p-tab-items");
  const tabQuick = document.getElementById("p-tab-quick");
  const itemArea = document.getElementById("p-item-area");
  const quickArea = document.getElementById("p-quick-area");

  tabItems.onclick = () => {
    saleMode = "items";
    tabItems.classList.add("active");
    tabQuick.classList.remove("active");
    itemArea.style.display = "block";
    quickArea.style.display = "none";
    updateTotal();
  };
  tabQuick.onclick = () => {
    saleMode = "amount";
    tabQuick.classList.add("active");
    tabItems.classList.remove("active");
    quickArea.style.display = "block";
    itemArea.style.display = "none";
    updateTotal();
  };

  // Payment Selection
  document.querySelectorAll(".p-pay-btn").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".p-pay-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedPayment = btn.dataset.method;
    };
  });

  // Search Logic
  const searchInput = document.getElementById("p-search");
  const resultsDiv = document.getElementById("p-results");
  const cartDiv = document.getElementById("p-cart-list");
  const totalVal = document.getElementById("p-total");
  const amountInput = document.getElementById("p-amount");

  searchInput.oninput = () => {
    const q = searchInput.value.toLowerCase().trim();
    if (!q) return (resultsDiv.innerHTML = "");

    const matches = stock.filter(s => s.name.toLowerCase().includes(q)).slice(0, 5);
    resultsDiv.innerHTML = matches.map(m => `
      <div class="p-drop-item" data-id="${m.id}">
        <strong>${m.name}</strong>
        <small>₹${m.price}</small>
      </div>
    `).join("");

    resultsDiv.querySelectorAll(".p-drop-item").forEach(row => {
      row.onclick = () => {
        const s = stock.find(x => x.id === row.dataset.id);
        const existing = cartItems.find(c => c.itemId === s.id);
        if (existing) existing.qty++;
        else cartItems.push({ itemId: s.id, name: s.name, price: s.price, qty: 1 });
        
        renderCart();
        searchInput.value = "";
        resultsDiv.innerHTML = "";
      };
    });
  };

  amountInput.oninput = () => updateTotal();

  function renderCart() {
    if (cartItems.length === 0) {
      cartDiv.innerHTML = `<div class="p-empty">Cart is empty</div>`;
    } else {
      cartDiv.innerHTML = cartItems.map((i, idx) => `
        <div class="p-item">
          <div class="p-item-info">
            <div>${i.name}</div>
            <small>₹${i.price} each</small>
          </div>
          <div class="p-qty">
            <button data-idx="${idx}" data-action="minus">-</button>
            <span>${i.qty}</span>
            <button data-idx="${idx}" data-action="plus">+</button>
          </div>
        </div>
      `).join("");

      cartDiv.querySelectorAll("button").forEach(btn => {
        btn.onclick = () => {
          const idx = parseInt(btn.dataset.idx);
          if (btn.dataset.action === "plus") cartItems[idx].qty++;
          else {
            cartItems[idx].qty--;
            if (cartItems[idx].qty <= 0) cartItems.splice(idx, 1);
          }
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

  // Save Transaction
  document.getElementById("p-save").onclick = async () => {
    const amount = parseFloat(totalVal.textContent);
    if (!amount || amount <= 0) return showToast("Please enter an amount", "error");

    const custName = document.getElementById("p-cust-name").value.trim();
    const custPhone = document.getElementById("p-cust-phone").value.trim();

    if (!custName || !custPhone) {
      showToast("Customer Name and Phone are required", "error");
      return;
    }

    if (custPhone.length < 10) {
      showToast("Please enter a valid 10-digit phone number", "error");
      return;
    }

    // UPI Logic
    if (selectedPayment === "upi") {
      const confirmed = await openUPIPayment(amount);
      if (!confirmed) return; // User cancelled UPI
    }

    const btn = document.getElementById("p-save");
    btn.disabled = true;
    btn.textContent = "...";

    const sale = {
      id: crypto.randomUUID(),
      amount,
      paymentMethod: selectedPayment,
      accountType: saleMode === "amount" ? "QUICK_SALE" : "ITEM_SALE",
      customerName: custName,
      customerPhone: custPhone,
      items: cartItems,
      date: new Date().toLocaleDateString(),
      timestamp: Date.now()
    };

    try {
      if (saleMode === "items") await processSale(sale);
      else await saveSale(sale);

      // Customer Sync
      const { resolveCustomerIdentity } = await import("../services/customerIdentityService.js");
      const customer = await resolveCustomerIdentity({ name: custName, phone: custPhone });
      
      if (customer?.id) {
        const { updateCustomerLoyalty } = await import("../services/loyaltyEngine.js");
        await updateCustomerLoyalty(customer.id, amount);
        if (shopId) {
          const { linkCustomerToShop, updateCustomerShopStats } = await import("../services/customerShopService.js");
          await linkCustomerToShop(customer.id, shopId);
          await updateCustomerShopStats({ customerId: customer.id, shopId, amount });
        }
      }

      showToast("Transaction Completed!", "success");
      navigate("dashboard");
    } catch (e) {
      showToast("Error saving sale", "error");
      btn.disabled = false;
      btn.textContent = "Finalize";
    }
  };
}
