import { renderLayout } from "../components/Layout";
import { getStock, saveSale, processSale, getShopSettings } from "../services/db";
import { showToast } from "../utils/toast";
import { t } from "../i18n/i18n";

export async function renderAddSale() {
  const stock = await getStock();
  const shopSettings = await getShopSettings();
  const shopId = shopSettings?.backendShopId;

  let cartItems = [];
  let saleMode = "amount"; // "amount" or "items"
  let selectedPayment = "cash";

  const app = document.getElementById("app");

  const content = `
    <section class="add-sale-page">
      <div class="page-header">
        <h1>Add New Sale</h1>
        <div class="mode-switch">
          <button id="mode-amount" class="active">Quick Amount</button>
          <button id="mode-items">Itemized Sale</button>
        </div>
      </div>

      <div class="sale-container">
        
        <!-- LEFT: Items / Amount -->
        <div class="sale-left">
          <div id="amount-section" class="glass-card">
            <div class="input-group">
              <label>Sale Amount</label>
              <div class="amount-field">
                <span>₹</span>
                <input id="amount" type="number" placeholder="0.00" step="0.01" />
              </div>
            </div>
          </div>

          <div id="item-sale-section" class="glass-card" style="display:none">
            <div class="input-group">
              <label>Select Products</label>
              <div class="stock-search-wrapper">
                <input id="stock-search" placeholder="Search stock..." />
              </div>
            </div>
            <div id="stock-list" class="stock-list">
              ${stock.map(s => `
                <div class="stock-item" data-id="${s.id}">
                  <div class="stock-item-info">
                    <span class="stock-item-name">${s.name}</span>
                    <span class="stock-item-price">₹${s.price}</span>
                  </div>
                  <button class="btn-add-mini" data-add="${s.id}">Add</button>
                </div>
              `).join("")}
            </div>
          </div>
        </div>

        <!-- RIGHT: Cart & Customer -->
        <div class="sale-right">
          <form id="sale-form">
            <div class="glass-card cart-card">
              <h3>Order Summary</h3>
              <div id="cart-list" class="cart-list">
                <p class="empty-text">No items added</p>
              </div>
              <div class="cart-footer">
                <span>Total</span>
                <span id="cart-total">₹0</span>
              </div>
            </div>

            <div class="glass-card customer-card">
              <div class="input-group">
                <label>Payment Method</label>
                <div class="payment-grid">
                  <button type="button" class="btn-payment active" data-method="cash">Cash</button>
                  <button type="button" class="btn-payment" data-method="upi">UPI</button>
                  <button type="button" class="btn-payment" data-method="credit">Credit</button>
                </div>
              </div>

              <div class="input-group">
                <label>Customer Name</label>
                <input id="customer" placeholder="John Doe (Optional)" />
              </div>

              <div class="input-group">
                <label>Mobile Number</label>
                <input id="customer-phone" type="tel" placeholder="9999999999" />
              </div>

              <div id="credit-advice" class="credit-advice"></div>

              <button type="submit" class="btn-primary full-width">Finalize Sale</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  `;

  document.querySelector(".main-content").innerHTML = content;

  // Cache elements
  const amountSection = document.getElementById("amount-section");
  const itemSection   = document.getElementById("item-sale-section");
  const cartDiv       = document.getElementById("cart-list");
  const cartTotal     = document.getElementById("cart-total");
  const amountInput   = document.getElementById("amount");
  const customerInput = document.getElementById("customer");
  const phoneInput    = document.getElementById("customer-phone");
  const adviceBox     = document.getElementById("credit-advice");

  // Mode Switching
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
  document.querySelectorAll(".btn-payment").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".btn-payment").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedPayment = btn.dataset.method;
      runCreditAdvisor();
    };
  });

  // Stock Search
  document.getElementById("stock-search")?.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll(".stock-item").forEach(el => {
      const name = el.querySelector(".stock-item-name").textContent.toLowerCase();
      el.style.display = name.includes(q) ? "flex" : "none";
    });
  });

  // Add to Cart
  document.querySelectorAll("[data-add]").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.add;
      const item = stock.find(s => s.id === id);
      const existing = cartItems.find(c => c.itemId === id);
      if (existing) existing.qty++;
      else cartItems.push({ itemId: id, name: item.name, price: item.price, qty: 1 });
      renderCart();
    };
  });

  function renderCart() {
    if (saleMode === "amount") {
      cartDiv.innerHTML = `<div class="cart-row"><span>Quick Sale</span><span>₹${amountInput.value || 0}</span></div>`;
      cartTotal.textContent = `₹${amountInput.value || 0}`;
    } else {
      if (cartItems.length === 0) {
        cartDiv.innerHTML = `<p class="empty-text">No items added</p>`;
        cartTotal.textContent = "₹0";
      } else {
        let total = 0;
        cartDiv.innerHTML = cartItems.map(i => {
          total += i.price * i.qty;
          return `
            <div class="cart-row">
              <div class="cart-row-info">
                <span>${i.name}</span>
                <small>₹${i.price} × ${i.qty}</small>
              </div>
              <div class="cart-row-total">₹${(i.price * i.qty).toFixed(2)}</div>
            </div>
          `;
        }).join("");
        cartTotal.textContent = `₹${total.toFixed(2)}`;
      }
    }
    runCreditAdvisor();
  }

  amountInput.oninput = renderCart;

  async function runCreditAdvisor() {
    const phone = phoneInput.value.trim();
    if (!phone || selectedPayment !== "credit") {
      adviceBox.style.display = "none";
      return;
    }
    const amount = saleMode === "amount" ? parseFloat(amountInput.value) : cartItems.reduce((s, i) => s + i.price * i.qty, 0);
    if (!amount) return;

    adviceBox.style.display = "block";
    adviceBox.innerHTML = `<div class="loading-advice">Checking credit health...</div>`;

    const { getCreditAdvice } = await import("../services/creditAdvisor.js");
    const advice = await getCreditAdvice(phone, amount);
    adviceBox.innerHTML = `<div class="advice-content ${advice.risk}">${advice.message}</div>`;
  }

  phoneInput.oninput = runCreditAdvisor;

  // Finalize
  document.getElementById("sale-form").onsubmit = async (e) => {
    e.preventDefault();
    const amount = saleMode === "amount" ? parseFloat(amountInput.value) : cartItems.reduce((s, i) => s + i.price * i.qty, 0);
    
    if (!amount || amount <= 0) {
      showToast("Please enter a valid amount", "error");
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
      customerName,
      customerPhone,
      items: cartItems,
      saleDate: new Date().toISOString()
    };

    if (saleMode === "items") await processSale(sale);
    else await saveSale(sale);

    // Update Loyalty
    if (customer?.id) {
      const { updateCustomerLoyalty } = await import("../services/loyaltyEngine.js");
      await updateCustomerLoyalty(customer.id, amount);

      if (shopId) {
        const { linkCustomerToShop, updateCustomerShopStats } = await import("../services/customerShopService.js");
        await linkCustomerToShop(customer.id, shopId);
        await updateCustomerShopStats({ customerId: customer.id, shopId, amount });
      }
    }

    showToast("Sale completed successfully!", "success");
    renderAddSale(); // Reset
  };
}
