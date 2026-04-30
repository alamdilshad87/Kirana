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
  let saleMode = "items"; // Matches screenshot toggle
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
          <div class="input-field">
            <input id="item-search" type="text" placeholder="Search item..." autocomplete="off" />
            <div id="search-results" class="search-dropdown-simple"></div>
          </div>

          <div class="cart-section-simple">
            <p class="section-label">Cart</p>
            <div id="cart-items-simple" class="cart-list-simple">
              <p class="empty-msg">No items added</p>
            </div>
            <div class="total-row-simple">
              <span>Total: ₹<span id="total-val">0</span></span>
            </div>
          </div>

          <div class="payment-section-simple">
            <p class="section-label">Payment Method</p>
            <div class="pay-btn-group">
              <button class="pay-option active" data-method="cash">Cash</button>
              <button class="pay-option" data-method="upi">UPI</button>
            </div>
            <button class="pay-option full-width-btn" data-method="credit">Credit</button>
          </div>

          <div class="customer-section-simple">
            <p class="section-label">Customer Name</p>
            <input id="cust-name" type="text" placeholder="Enter customer name" />
            
            <p class="section-label" style="margin-top:16px">Customer Mobile Number</p>
            <input id="cust-phone" type="tel" placeholder="Enter Mobile Number" />
          </div>

          <button id="finalize-btn" class="finalize-action-btn">Save</button>
        </div>
      </div>
    </section>

    <style>
      .add-transaction-page { display: flex; justify-content: center; padding-top: 40px; }
      .transaction-container {
        width: 100%;
        max-width: 440px;
        background: rgba(15,23,42,0.6);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 20px;
        padding: 32px;
        backdrop-filter: blur(20px);
      }
      .transaction-title { font-size: 20px; font-weight: 800; color: #fff; margin-bottom: 24px; }
      
      .transaction-tabs { display: flex; gap: 8px; margin-bottom: 24px; }
      .trans-tab {
        padding: 6px 16px;
        border-radius: 99px;
        border: 1px solid rgba(255,255,255,0.1);
        background: transparent;
        color: #94a3b8;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }
      .trans-tab.active { background: #22c55e22; color: #22c55e; border-color: #22c55e44; box-shadow: 0 0 15px rgba(34,197,94,0.2); }

      .section-label { font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 8px; }
      
      .input-field input {
        width: 100%;
        padding: 12px 16px;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 10px;
        color: #fff;
        font-size: 14px;
        margin-bottom: 20px;
      }

      .cart-section-simple { background: rgba(0,0,0,0.15); border-radius: 12px; padding: 16px; margin-bottom: 20px; }
      .cart-list-simple { min-height: 40px; }
      .empty-msg { font-size: 12px; color: #475569; }
      .total-row-simple { margin-top: 12px; font-size: 13px; font-weight: 700; color: #fff; }

      .pay-btn-group { display: flex; gap: 10px; margin-bottom: 10px; }
      .pay-option {
        flex: 1;
        padding: 12px;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 10px;
        color: #94a3b8;
        font-weight: 600;
        cursor: pointer;
        font-size: 13px;
      }
      .pay-option.active { border-color: #3b82f6; color: #fff; background: rgba(59,130,246,0.1); }
      .full-width-btn { width: 100%; margin-top: 0px; }

      .customer-section-simple { margin-top: 24px; }
      .customer-section-simple input {
        width: 100%;
        padding: 12px 16px;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 10px;
        color: #fff;
        font-size: 14px;
      }

      .finalize-action-btn {
        width: 100%;
        padding: 16px;
        background: #22c55e;
        color: #fff;
        border: none;
        border-radius: 12px;
        font-weight: 800;
        font-size: 15px;
        margin-top: 32px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .finalize-action-btn:hover { opacity: 0.9; transform: scale(0.99); }

      .search-dropdown-simple { position: relative; }
      .search-drop-box {
        position: absolute; top: -16px; left: 0; right: 0; background: #1a2235; border: 1px solid #22c55e;
        border-radius: 10px; z-index: 50; max-height: 150px; overflow-y: auto;
      }
      .drop-item { padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; display: flex; justify-content: space-between; }
      .drop-item:hover { background: rgba(255,255,255,0.05); }
      .drop-item span { font-size: 13px; color: #fff; }
      .drop-item small { color: #64748b; }
    </style>
  `;

  document.querySelector(".main-content").innerHTML = content;

  // Cache elements
  const searchInput = document.getElementById("item-search");
  const resultsDiv = document.getElementById("search-results");
  const cartDiv = document.getElementById("cart-items-simple");
  const totalVal = document.getElementById("total-val");
  const finalizeBtn = document.getElementById("finalize-btn");

  // Toggle Modes
  document.getElementById("tab-quick").onclick = () => {
    saleMode = "amount";
    document.getElementById("tab-quick").classList.add("active");
    document.getElementById("tab-item").classList.remove("active");
    searchInput.placeholder = "Enter quick amount...";
    renderCart();
  };
  document.getElementById("tab-item").onclick = () => {
    saleMode = "items";
    document.getElementById("tab-item").classList.add("active");
    document.getElementById("tab-quick").classList.remove("active");
    searchInput.placeholder = "Search item...";
    renderCart();
  };

  // Payment Selection
  document.querySelectorAll(".pay-option").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".pay-option").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedPayment = btn.dataset.method;
    };
  });

  // Search Logic
  searchInput.oninput = () => {
    const q = searchInput.value.toLowerCase().trim();
    if (!q) return (resultsDiv.innerHTML = "");

    if (saleMode === "amount") {
      renderCart();
      return;
    }

    const matches = stock.filter(s => s.name.toLowerCase().includes(q)).slice(0, 5);
    resultsDiv.innerHTML = matches.length ? `
      <div class="search-drop-box">
        ${matches.map(m => `
          <div class="drop-item" data-id="${m.id}">
            <span>${m.name}</span>
            <small>₹${m.price}</small>
          </div>
        `).join("")}
      </div>
    ` : "";

    resultsDiv.querySelectorAll(".drop-item").forEach(item => {
      item.onclick = () => {
        const id = item.dataset.id;
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

  function renderCart() {
    if (saleMode === "amount") {
      const amt = parseFloat(searchInput.value) || 0;
      cartDiv.innerHTML = `<div class="drop-item"><span>Quick Sale</span><span>₹${amt}</span></div>`;
      totalVal.textContent = amt;
    } else {
      if (cartItems.length === 0) {
        cartDiv.innerHTML = `<p class="empty-msg">No items added</p>`;
        totalVal.textContent = "0";
      } else {
        let total = 0;
        cartDiv.innerHTML = cartItems.map(i => {
          total += i.price * i.qty;
          return `<div class="drop-item"><span>${i.name} × ${i.qty}</span><span>₹${i.price * i.qty}</span></div>`;
        }).join("");
        totalVal.textContent = total;
      }
    }
  }

  // Finalize
  finalizeBtn.onclick = async () => {
    const amount = parseFloat(totalVal.textContent);
    if (!amount || amount <= 0) return showToast("Invalid amount", "error");

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

    if (saleMode === "items") await processSale(sale);
    else await saveSale(sale);

    showToast("Transaction Saved!", "success");
    navigate("dashboard");
  };
}
