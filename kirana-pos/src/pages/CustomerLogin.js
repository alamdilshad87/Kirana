import { loginCustomer, getCustomerByPhone } from "../services/customerAuthService";

export async function renderCustomerLogin(container) {
  const urlParams = new URLSearchParams(window.location.search || window.location.hash.split("?")[1] || "");
  const shopId = urlParams.get("shopId");
  
  if (shopId) {
    localStorage.setItem("kirana_db_name", `kirana_pos_${shopId}`);
  } else {
    // Fallback to the last shop accessed on this device
    const lastDb = localStorage.getItem("last_shop_db");
    if (lastDb) {
      localStorage.setItem("kirana_db_name", lastDb);
    }
  }

  container.innerHTML = `
    <div class="auth-page">
      <div class="auth-bg">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
      </div>

      <div class="glass-card auth-card">
        <div class="auth-header">
          <div class="auth-icon">👥</div>
          <h1>Customer Portal</h1>
          <p>Login to view your points and coupons</p>
        </div>

        <div class="auth-body">
          <div class="input-group">
            <label>Phone Number</label>
            <div class="input-wrapper">
              <span class="input-adornment">📱</span>
              <input id="cust-phone" type="tel" placeholder="Enter your mobile number" />
            </div>
          </div>

          <div class="input-group">
            <label>Password</label>
            <div class="input-wrapper">
              <span class="input-adornment">🔒</span>
              <input id="cust-password" type="password" placeholder="••••••••" />
            </div>
          </div>

          <button id="cust-login" class="btn-primary full-width">
            Sign In
          </button>

          <button id="cust-register" class="btn-secondary full-width" style="margin-top:12px;">
            Create New Account
          </button>

          <div class="auth-footer">
            <a href="#customer-forgot-password">Forgot Password?</a>
            <div class="divider"></div>
            <a href="#login" style="color:var(--text-secondary);font-weight:400;">Login as Shopkeeper</a>
          </div>

          <div id="cust-error" class="error-msg"></div>
        </div>
      </div>
    </div>

    <style>
      .auth-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: #080F1E;
        position: relative;
        overflow: hidden;
      }
      .auth-bg { position: absolute; inset: 0; pointer-events: none; }
      .blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.12; }
      .blob-1 { width: 400px; height: 400px; background: #22c55e; top: -100px; left: -100px; }
      .blob-2 { width: 300px; height: 300px; background: #6366f1; bottom: -50px; right: -50px; }

      .auth-card {
        width: 100%;
        max-width: 400px;
        padding: 40px;
        border-radius: 24px;
        z-index: 2;
      }
      .auth-header { text-align: center; margin-bottom: 32px; }
      .auth-icon { font-size: 48px; margin-bottom: 16px; }
      .auth-header h1 { font-size: 24px; font-weight: 700; margin-bottom: 8px; color: #fff; }
      .auth-header p { font-size: 14px; color: #64748b; }

      .input-group { margin-bottom: 20px; }
      .input-group label { display: block; font-size: 13px; font-weight: 600; color: #94a3b8; margin-bottom: 8px; }
      .input-wrapper { position: relative; }
      .input-adornment { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 16px; opacity: 0.6; }
      .input-wrapper input {
        width: 100%;
        padding: 12px 12px 12px 42px;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        color: #fff;
        font-size: 15px;
        transition: border-color 0.2s;
      }
      .input-wrapper input:focus { border-color: #22c55e; outline: none; }

      .full-width { width: 100%; padding: 14px; font-size: 15px; font-weight: 600; border-radius: 12px; cursor: pointer; }
      .btn-primary { background: #22c55e; color: #fff; border: none; }
      .btn-secondary { background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); }

      .auth-footer { margin-top: 24px; text-align: center; }
      .auth-footer a { color: #22c55e; text-decoration: none; font-size: 14px; font-weight: 600; display: block; margin-bottom: 12px; }
      .divider { height: 1px; background: rgba(255,255,255,0.08); margin: 16px 0; }

      .error-msg { color: #ef4444; font-size: 13px; text-align: center; margin-top: 16px; min-height: 20px; }
    </style>
  `;


  /* LOGIN */
    document.getElementById("cust-login").onclick = async () => {

     const phone =
      document.getElementById("cust-phone").value.trim();

     const password =
       document.getElementById("cust-password").value.trim();
     const error =
        document.getElementById("cust-error");

     error.textContent = "";

        if (!phone || !password) {
         error.textContent = "Enter phone and password";
         return;
        }

        const customer =
          await loginCustomer(phone, password);

        if (!customer) {
         error.textContent = "Invalid phone or password";
         return;
        }

        location.hash = "customer-portal";
    };


  /* REGISTER BUTTON */
  document.getElementById("cust-register").onclick = () => {

    const phone =
      document.getElementById("cust-phone").value.trim();

    if (!phone) {
      document.getElementById("cust-error").textContent =
        "Enter phone number first";
      return;
    }

    location.hash =
      "customer-register?phone=" + phone;
  };

}