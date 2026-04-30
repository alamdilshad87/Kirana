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
          <div class="title-group">
             <h2>Add Transaction</h2>
             <p class="subtitle-small">Complete your sale entry below</p>
          </div>
          <div class="pro-tabs">
            <button id="p-tab-items" class="p-tab active">Items Sale</button>
            <button id="p-tab-quick" class="p-tab">Quick Sale</button>
          </div>
        </div>

        <div class="pro-card-body">
          <!-- SEARCH & CART -->
          <div id="p-item-area">
            <div class="p-search-wrap">
              <input id="p-search" type="text" placeholder="Search product name or scan..." autocomplete="off" />
              <div id="p-results" class="p-dropdown"></div>
            </div>

            <div class="p-cart-container">
              <div id="p-cart-list" class="p-cart-list">
                <div class="p-empty">No items in cart.</div>
              </div>
            </div>
          </div>

          <!-- QUICK AMOUNT -->
          <div id="p-quick-area" style="display:none">
            <div class="quick-input-wrap">
              <span class="currency-symbol">₹</span>
              <input id="p-amount" type="number" placeholder="0.00" class="p-large-input" />
            </div>
          </div>

          <div class="p-divider"></div>

          <!-- FOOTER: PAYMENT & CUSTOMER -->
          <div class="p-footer-rows">
            <!-- Row 1 -->
            <div class="p-footer-row">
              <div class="p-col">
                <label class="p-label">PAYMENT METHOD</label>
                <button class="p-pay-btn active" data-method="cash">💵 Cash Payment</button>
              </div>
              <div class="p-col">
                <label class="p-label">CUSTOMER NAME <span class="req">*</span></label>
                <input id="p-cust-name" type="text" placeholder="Full Name" class="formal-input" />
              </div>
            </div>

            <!-- Row 2 -->
            <div class="p-footer-row">
              <div class="p-col">
                <button class="p-pay-btn" data-method="upi">📱 UPI / QR Scan</button>
              </div>
              <div class="p-col">
                <label class="p-label">MOBILE NUMBER <span class="req">*</span></label>
                <input id="p-cust-phone" type="tel" placeholder="10-digit number" maxlength="10" class="formal-input" />
              </div>
            </div>

            <!-- Row 3 -->
            <div class="p-footer-row">
              <div class="p-col">
                <button class="p-pay-btn" data-method="credit">💳 Credit (Udhaar)</button>
              </div>
              <div class="p-col">
                <!-- Spacing filler -->
              </div>
            </div>
          </div>

          <!-- ACTION BAR -->
          <div class="p-action-bar">
            <div class="total-display">
              <span class="total-label">TOTAL AMOUNT</span>
              <span class="total-value">₹<span id="p-total">0</span></span>
            </div>
            <button id="p-save" class="p-save-btn">
               <span class="btn-icon">✓</span> Finalize Sale
            </button>
          </div>
        </div>
      </div>
    </section>

    <style>
      .add-sale-pro { display: flex; justify-content: center; padding: 40px 20px; }
      .pro-card { 
        width: 100%; max-width: 760px; 
        background: rgba(10, 15, 30, 0.6); 
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 28px; padding: 40px;
        box-shadow: 0 50px 100px rgba(0,0,0,0.6);
        backdrop-filter: blur(40px);
        overflow: visible;
      }
      
      .pro-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
      .title-group h2 { font-size: 22px; color: #fff; font-weight: 800; margin: 0; }
      .subtitle-small { font-size: 12px; color: #64748b; margin-top: 4px; }
      
      .pro-tabs { display: flex; background: rgba(255,255,255,0.04); padding: 4px; border-radius: 12px; }
      .p-tab { padding: 8px 18px; border: none; background: transparent; color: #64748b; font-size: 11px; font-weight: 800; cursor: pointer; border-radius: 9px; transition: 0.2s; text-transform: uppercase; }
      .p-tab.active { background: #22c55e; color: #fff; }

      .p-search-wrap { position: relative; margin-bottom: 24px; }
      .p-search-wrap input { width: 100%; padding: 18px 24px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; color: #fff; outline: none; font-size: 16px; }
      .p-search-wrap input:focus { border-color: #22c55e; background: rgba(255,255,255,0.08); }

      .p-dropdown { position: absolute; top: 68px; left: 0; right: 0; background: #0f172a; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; z-index: 100; max-height: 200px; overflow-y: auto; }
      .p-drop-item { display: flex; justify-content: space-between; padding: 14px 24px; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; }
      .p-drop-item:hover { background: rgba(255,255,255,0.05); }

      .p-cart-container { background: rgba(0,0,0,0.15); border-radius: 18px; padding: 4px; margin-bottom: 32px; }
      .p-cart-list { padding: 12px; overflow: visible; min-height: 40px; }
      .p-empty { text-align: center; color: #475569; font-size: 14px; padding: 20px; font-style: italic; }
      
      .p-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; background: rgba(255,255,255,0.02); border-radius: 14px; margin-bottom: 8px; border: 1px solid rgba(255,255,255,0.05); }
      .p-item-info div { color: #fff; font-size: 15px; font-weight: 600; }
      .p-item-info small { color: #64748b; font-size: 13px; }
      
      .p-qty { display: flex; align-items: center; background: rgba(255,255,255,0.08); border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
      .p-qty button { width: 34px; height: 34px; border: none; background: transparent; color: #fff; font-size: 18px; cursor: pointer; }
      .p-qty span { min-width: 36px; text-align: center; color: #fff; font-size: 14px; font-weight: 700; border-left: 1px solid rgba(255,255,255,0.1); border-right: 1px solid rgba(255,255,255,0.1); }

      .quick-input-wrap { position: relative; display: flex; align-items: center; justify-content: center; margin-bottom: 32px; }
      .currency-symbol { position: absolute; left: 30px; font-size: 32px; font-weight: 800; color: #22c55e; opacity: 0.5; }
      .p-large-input { width: 100%; padding: 24px 24px 24px 70px; font-size: 44px; font-weight: 900; background: rgba(34,197,94,0.02); border: 2px dashed rgba(34,197,94,0.2); border-radius: 20px; color: #22c55e; outline: none; }
      
      .p-divider { height: 1px; background: rgba(255,255,255,0.08); margin-bottom: 40px; }

      /* ALIGNMENT FIX: Mirroring Rows */
      .p-footer-rows { display: flex; flex-direction: column; gap: 16px; margin-bottom: 40px; }
      .p-footer-row { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: flex-end; }
      .p-col { display: flex; flex-direction: column; }
      
      .p-label { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; min-height: 14px; }
      .formal-input { padding: 14px 18px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; font-size: 15px; outline: none; }
      .p-pay-btn { padding: 14px 18px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); color: #94a3b8; font-size: 14px; font-weight: 700; cursor: pointer; border-radius: 12px; text-align: left; height: 50px; }
      .p-pay-btn.active { background: rgba(34,197,94,0.12); color: #22c55e; border-color: #22c55e44; }

      .req { color: #ef4444; }

      .p-action-bar { display: flex; justify-content: space-between; align-items: center; padding: 24px 32px; background: rgba(255,255,255,0.04); border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); }
      .total-label { font-size: 11px; font-weight: 800; color: #64748b; }
      .total-value { font-size: 32px; font-weight: 900; color: #fff; }
      .total-value span { color: #22c55e; }
      
      .p-save-btn { padding: 16px 36px; background: #22c55e; color: #fff; border: none; border-radius: 16px; font-weight: 800; font-size: 16px; cursor: pointer; transition: 0.2s; box-shadow: 0 10px 25px rgba(34,197,94,0.3); display: flex; align-items: center; gap: 10px; }
      .p-save-btn:hover { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(34,197,94,0.4); }

      @media (max-width: 680px) {
        .p-footer-row { grid-template-columns: 1fr; gap: 20px; }
        .p-action-bar { flex-direction: column; gap: 24px; text-align: center; }
      }
    </style>
  `;

  document.querySelector(".main-content").innerHTML = content;

  // Cache elements
  const tabItems = document.getElementById("p-tab-items");
  const tabQuick = document.getElementById("p-tab-quick");
  const itemArea = document.getElementById("p-item-area");
  const quickArea = document.getElementById("p-quick-area");
  const searchInput = document.getElementById("p-search");
  const resultsDiv = document.getElementById("p-results");
  const cartDiv = document.getElementById("p-cart-list");
  const totalVal = document.getElementById("p-total");
  const amountInput = document.getElementById("p-amount");

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

  document.querySelectorAll(".p-pay-btn").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".p-pay-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedPayment = btn.dataset.method;
    };
  });

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
      cartDiv.innerHTML = `<div class="p-empty">No items in cart.</div>`;
    } else {
      cartDiv.innerHTML = cartItems.map((i, idx) => `
        <div class="p-item">
          <div class="p-item-info">
            <div>${i.name}</div>
            <small>₹${i.price} / unit</small>
          </div>
          <div class="p-qty">
            <button data-idx="${idx}" data-action="minus">−</button>
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

  document.getElementById("p-save").onclick = async () => {
    const amount = parseFloat(totalVal.textContent);
    if (!amount || amount <= 0) return showToast("Amount is missing", "error");

    const custName = document.getElementById("p-cust-name").value.trim();
    const custPhone = document.getElementById("p-cust-phone").value.trim();

    if (!custName || !custPhone) return showToast("Name and Phone are mandatory", "error");
    if (custPhone.length < 10) return showToast("Enter a 10-digit phone number", "error");

    if (selectedPayment === "upi") {
      const confirmed = await openUPIPayment(amount);
      if (!confirmed) return;
    }

    const btn = document.getElementById("p-save");
    btn.disabled = true;
    btn.textContent = "Finalizing...";

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
      showToast("Sale Completed!", "success");
      navigate("dashboard");
    } catch {
      btn.disabled = false;
      btn.textContent = "Finalize Sale";
    }
  };
}
