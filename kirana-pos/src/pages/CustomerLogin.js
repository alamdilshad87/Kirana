import { loginCustomer } from "../services/customerAuthService";

export async function renderCustomerLogin(container) {

  container.innerHTML = `
    <div class="auth-page">
      <div class="auth-bg">
        <div class="blob-subtle"></div>
      </div>

      <div class="glass-card-formal auth-card">
        <div class="auth-header">
          <h1>Customer Access</h1>
          <p>Secure login to your personal loyalty portal</p>
        </div>

        <div class="auth-body">
          <div class="input-group-formal">
            <label>Phone Number</label>
            <input id="cust-phone" type="tel" placeholder="9999999999" />
          </div>

          <div class="input-group-formal">
            <label>Password</label>
            <input id="cust-password" type="password" placeholder="••••••••" />
          </div>

          <button id="cust-login" class="btn-formal-primary">
            Sign In
          </button>

          <button id="cust-register" class="btn-formal-secondary">
            Create Account
          </button>

          <div class="auth-footer-formal">
            <a href="#customer-forgot-password">Trouble signing in?</a>
            <div class="auth-divider"></div>
            <a href="#login" class="switch-link">Access Shop Management</a>
          </div>

          <div id="cust-error" class="error-text"></div>
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
        background: #080d1a;
        position: relative;
        font-family: 'Inter', -apple-system, sans-serif;
      }
      .auth-bg { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
      .blob-subtle { 
        position: absolute; width: 600px; height: 600px; 
        background: radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%); 
        top: -200px; left: -200px; 
      }

      .glass-card-formal {
        width: 100%;
        max-width: 380px;
        padding: 48px 40px;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 24px;
        backdrop-filter: blur(32px);
        box-shadow: 0 40px 100px rgba(0,0,0,0.6);
      }
      .auth-header { text-align: center; margin-bottom: 36px; }
      .auth-header h1 { font-size: 24px; font-weight: 800; letter-spacing: -1px; color: #fff; margin-bottom: 8px; }
      .auth-header p { font-size: 13px; color: #64748b; line-height: 1.5; }

      .input-group-formal { margin-bottom: 24px; }
      .input-group-formal label { display: block; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
      .input-group-formal input {
        width: 100%;
        padding: 14px 16px;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        color: #fff;
        font-size: 15px;
        transition: all 0.2s ease;
      }
      .input-group-formal input:focus { border-color: #22c55e; background: rgba(255,255,255,0.08); outline: none; }

      .btn-formal-primary {
        width: 100%; padding: 16px; background: #22c55e; color: #fff; border: none; border-radius: 12px;
        font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s;
      }
      .btn-formal-primary:hover { transform: translateY(-2px); opacity: 0.9; }
      .btn-formal-secondary {
        width: 100%; padding: 14px; background: rgba(255,255,255,0.08); color: #e2e8f0; border: 1px solid rgba(255,255,255,0.12); 
        border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 12px; transition: all 0.2s;
      }
      .btn-formal-secondary:hover { background: rgba(255,255,255,0.12); }

      .auth-footer-formal { margin-top: 32px; text-align: center; }
      .auth-footer-formal a { color: #22c55e; text-decoration: none; font-size: 13px; font-weight: 600; }
      .auth-divider { height: 1px; background: rgba(255,255,255,0.1); margin: 20px auto; width: 60%; }
      .switch-link { color: #64748b !important; font-size: 12px !important; }

      .error-text { color: #f87171; font-size: 12px; text-align: center; margin-top: 16px; min-height: 18px; }
    </style>
  `;

  document.getElementById("cust-login").onclick = async () => {
    const phone = document.getElementById("cust-phone").value.trim();
    const password = document.getElementById("cust-password").value.trim();
    const error = document.getElementById("cust-error");

    error.textContent = "";

    if (!phone || !password) {
      error.textContent = "Phone and password required";
      return;
    }

    const result = await loginCustomer(phone, password);

    if (result.success) {
      location.hash = "customer-portal";
    } else {
      error.textContent = result.message || "Invalid credentials";
    }
  };

  document.getElementById("cust-register").onclick = () => {
    location.hash = "customer-register";
  };
}