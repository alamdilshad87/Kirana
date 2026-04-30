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

        <div class="toggle-row">
          <button id="mode-item" class="toggle-btn active">Item Sale</button>
          <button id="mode-amount" class="toggle-btn">Quick Sale</button>
        </div>

        <div class="transaction-content">
          <div id="item-mode-wrap">
            <input id="item-search" type="text" placeholder="Search item..." class="search-input" />
            <div id="search-results" class="results-list"></div>
            
            <div class="cart-box">
              <p>Cart</p>
              <div id="cart-items" class="cart-items">
                <p style="color:#64748b;font-size:13px">No items added</p>
              </div>
              <div class="cart-total">
                <span>Total: ₹</span>
                <span id="total-val">0</span>
              </div>
            </div>
          </div>

          <div id="amount-mode-wrap" style="display:none">
            <input id="quick-amount" type="number" placeholder="Enter amount..." class="amount-input" />
          </div>

          <div class="payment-section">
            <p class="section-label">Payment Method</p>
            <div class="payment-btns">
              <button class="pay-btn active" data-method="cash">Cash</button>
              <button class="pay-btn" data-method="upi">UPI</button>
            </div>
            <button class="pay-btn credit-btn" data-method="credit">Credit</button>
          </div>

          <div class="customer-section">
            <input id="cust-name" type="text" placeholder="Customer Name" class="cust-input" />
            <input id="cust-phone" type="tel" placeholder="Mobile Number" class="cust-input" />
          </div>

          <button id="save-transaction" class="save-btn">Save</button>
        </div>
      </div>
    </section>

    <style>
      .add-transaction-page { display: flex; justify-content: center; padding: 20px; }
      .transaction-container {
        width: 100%;
        max-width: 440px;
        background: rgba(15,23,42,0.4);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 20px;
        padding: 32px;
        backdrop-filter: blur(20px);
        box-shadow: 0 30px 60px rgba(0,0,0,0.4);
        overflow: visible;
      }
      .transaction-title { font-size: 20px; font-weight: 800; color: #fff; margin-bottom: 24px; }
      
      .toggle-row { display: flex; gap: 10px; margin-bottom: 20px; }
      .toggle-btn { flex: 1; padding: 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #94a3b8; cursor: pointer; font-weight: 600; }
      .toggle-btn.active { background: #22c55e; color: #fff; border-color: #22c55e; }

      .search-input, .amount-input, .cust-input { width: 100%; padding: 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #fff; margin-bottom: 12px; outline: none; }
      .results-list { background: #111827; border-radius: 10px; margin-top: -8px; margin-bottom: 12px; max-height: 150px; overflow-y: auto; }
      .res-item { padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; display: flex; justify-content: space-between; }
      .res-item:hover { background: rgba(255,255,255,0.05); }

      .cart-box { background: rgba(0,0,0,0.25); padding: 18px; border-radius: 14px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.05); }
      .cart-items { margin: 12px 0; max-height: 200px; overflow-y: auto; }
      
      .cart-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.03); }
      .cart-item-info { flex: 1; }
      .cart-item-name { color: #fff; font-size: 14px; font-weight: 600; display: block; }
      .cart-item-price { color: #64748b; font-size: 12px; }

      .cart-qty-ctrl { display: flex; align-items: center; background: rgba(255,255,255,0.06); border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; }
      .cart-qty-ctrl button { width: 30px; height: 30px; border: none; background: transparent; color: #fff; font-size: 16px; font-weight: 800; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
      .cart-qty-ctrl button:hover { background: rgba(255,255,255,0.08); }
      .cart-qty-ctrl span { min-width: 32px; text-align: center; font-size: 13px; font-weight: 700; color: #22c55e; border-left: 1px solid rgba(255,255,255,0.08); border-right: 1px solid rgba(255,255,255,0.08); height: 30px; display: flex; align-items: center; justify-content: center; }

      .cart-total { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px; font-weight: 800; color: #fff; display: flex; justify-content: space-between; font-size: 16px; }
      .cart-total span:last-child { color: #22c55e; }

      .section-label { font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 8px; }
      .payment-btns { display: flex; gap: 10px; margin-bottom: 10px; }
      .pay-btn { flex: 1; padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #94a3b8; cursor: pointer; font-weight: 700; }
      .pay-btn.active { border-color: #3b82f6; color: #3b82f6; background: rgba(59,130,246,0.1); }
      .credit-btn { width: 100%; margin-bottom: 20px; }

      .save-btn { width: 100%; padding: 16px; background: #22c55e; color: #fff; border: none; border-radius: 12px; font-weight: 800; font-size: 16px; cursor: pointer; box-shadow: 0 10px 20px rgba(34,197,94,0.3); }
    </style>
  `;

  document.querySelector(".main-content").innerHTML = content;

  const modeItem = document.getElementById("mode-item");
  const modeAmount = document.getElementById("mode-amount");
  const itemWrap = document.getElementById("item-mode-wrap");
  const amountWrap = document.getElementById("amount-mode-wrap");
  const searchInput = document.getElementById("item-search");
  const resultsDiv = document.getElementById("search-results");
  const cartDiv = document.getElementById("cart-items");
  const totalVal = document.getElementById("total-val");
  const finalizeBtn = document.getElementById("save-transaction");

  modeItem.onclick = () => {
    saleMode = "items";
    modeItem.classList.add("active");
    modeAmount.classList.remove("active");
    itemWrap.style.display = "block";
    amountWrap.style.display = "none";
  };
  modeAmount.onclick = () => {
    saleMode = "amount";
    modeAmount.classList.add("active");
    modeItem.classList.remove("active");
    amountWrap.style.display = "block";
    itemWrap.style.display = "none";
  };

  document.querySelectorAll(".pay-btn").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".pay-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedPayment = btn.dataset.method;
    };
  });

  searchInput.oninput = () => {
    const q = searchInput.value.toLowerCase().trim();
    if (!q) return (resultsDiv.innerHTML = "");
    const matches = stock.filter(s => s.name.toLowerCase().includes(q)).slice(0, 5);
    resultsDiv.innerHTML = matches.map(m => `
      <div class="res-item" data-id="${m.id}">
        <span>${m.name}</span>
        <span>₹${m.price}</span>
      </div>
    `).join("");

    resultsDiv.querySelectorAll(".res-item").forEach(row => {
      row.onclick = () => {
        const s = stock.find(x => x.id === row.dataset.id);
        const existing = cartItems.find(c => c.id === s.id);
        if (existing) {
          existing.qty = (existing.qty || 1) + 1;
        } else {
          cartItems.push({ ...s, qty: 1 });
        }
        renderCart();
        searchInput.value = "";
        resultsDiv.innerHTML = "";
      };
    });
  };

  function renderCart() {
    if (cartItems.length === 0) {
      cartDiv.innerHTML = `<p style="color:#64748b;font-size:13px;text-align:center;padding:10px">No items added</p>`;
      totalVal.textContent = "0";
    } else {
      let total = 0;
      cartDiv.innerHTML = cartItems.map((i, idx) => {
        total += (i.price * (i.qty || 1));
        return `
          <div class="cart-row">
            <div class="cart-item-info">
              <span class="cart-item-name">${i.name}</span>
              <span class="cart-item-price">₹${i.price} / unit</span>
            </div>
            <div class="cart-qty-ctrl">
              <button data-idx="${idx}" data-action="minus">−</button>
              <span>${i.qty || 1}</span>
              <button data-idx="${idx}" data-action="plus">+</button>
            </div>
          </div>
        `;
      }).join("");
      
      totalVal.textContent = total.toFixed(2);

      cartDiv.querySelectorAll("button").forEach(btn => {
        btn.onclick = () => {
          const idx = parseInt(btn.dataset.idx);
          if (!cartItems[idx].qty) cartItems[idx].qty = 1;
          
          if (btn.dataset.action === "plus") {
            cartItems[idx].qty++;
          } else {
            cartItems[idx].qty--;
            if (cartItems[idx].qty <= 0) cartItems.splice(idx, 1);
          }
          renderCart();
        };
      });
    }
  }

  finalizeBtn.onclick = async () => {
    const amount = saleMode === "amount" ? parseFloat(document.getElementById("quick-amount").value) : parseFloat(totalVal.textContent);
    if (!amount || amount <= 0) return showToast("Invalid amount", "error");

    finalizeBtn.disabled = true;
    finalizeBtn.textContent = "...";

    const sale = {
      id: crypto.randomUUID(),
      amount,
      paymentMethod: selectedPayment,
      accountType: saleMode === "amount" ? "QUICK_SALE" : "ITEM_SALE",
      customerName: document.getElementById("cust-name").value.trim() || "Walk-in",
      customerPhone: document.getElementById("cust-phone").value.trim(),
      items: cartItems,
      date: new Date().toLocaleDateString(),
      timestamp: Date.now()
    };

    try {
      if (saleMode === "items") await processSale(sale);
      else await saveSale(sale);
      showToast("Saved!", "success");
      navigate("dashboard");
    } catch {
      finalizeBtn.disabled = false;
      finalizeBtn.textContent = "Save";
    }
  };
}
