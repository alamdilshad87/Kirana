import { createCustomerAccount } from "../services/customerAuthService";

export async function renderCustomerRegister(container) {

  container.innerHTML = `
    <div class="auth-page">
      <div class="auth-bg">
        <div class="blob-subtle"></div>
      </div>

      <div class="glass-card-formal auth-card">
        <div class="auth-header">
          <h1>Customer Registration</h1>
          <p>Create a secure account to track your loyalty points</p>
        </div>

        <div class="auth-body">
          <div class="input-group-formal">
            <label>Full Name</label>
            <input id="cust-name" placeholder="Enter your name" />
          </div>

          <div class="input-group-formal">
            <label>Phone Number</label>
            <input id="cust-phone" type="tel" placeholder="9999999999" />
          </div>

          <div class="input-group-formal">
            <label>Set Password</label>
            <input id="cust-password" type="password" placeholder="••••••••" />
          </div>

          <button id="cust-register-btn" class="btn-formal-primary">
            Complete Registration
          </button>

          <div class="auth-footer-formal">
            <a href="#customer-login">Already have an account? Sign In</a>
          </div>

          <div id="cust-error" class="error-text"></div>
        </div>
      </div>
    </div>

    <style>
      /* Global-like auth styles for consistency */
      .auth-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: #0a0c10;
        position: relative;
        font-family: 'Inter', -apple-system, sans-serif;
      }
      .auth-bg { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
      .blob-subtle { 
        position: absolute; width: 600px; height: 600px; 
        background: radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%); 
        top: -200px; left: -200px; 
      }

      .glass-card-formal {
        width: 100%;
        max-width: 380px;
        padding: 48px 40px;
        background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 20px;
        backdrop-filter: blur(24px);
        box-shadow: 0 20px 50px rgba(0,0,0,0.3);
      }
      .auth-header { text-align: center; margin-bottom: 36px; }
      .auth-header h1 { font-size: 22px; font-weight: 600; letter-spacing: -0.5px; color: #fff; margin-bottom: 8px; }
      .auth-header p { font-size: 13px; color: #64748b; line-height: 1.5; }

      .input-group-formal { margin-bottom: 24px; }
      .input-group-formal label { display: block; font-size: 12px; font-weight: 500; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
      .input-group-formal input {
        width: 100%;
        padding: 12px 16px;
        background: rgba(0,0,0,0.2);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px;
        color: #fff;
        font-size: 14px;
      }
      .input-group-formal input:focus { border-color: #22c55e; background: rgba(0,0,0,0.4); outline: none; }

      .btn-formal-primary {
        width: 100%; padding: 14px; background: #22c55e; color: #fff; border: none; border-radius: 8px;
        font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.2s;
      }
      .auth-footer-formal { margin-top: 32px; text-align: center; }
      .auth-footer-formal a { color: #22c55e; text-decoration: none; font-size: 13px; font-weight: 500; }
      .error-text { color: #f87171; font-size: 12px; text-align: center; margin-top: 16px; min-height: 18px; }
    </style>
  `;


  document.getElementById("cust-register-btn").onclick = async () => {

    const name =
      document.getElementById("cust-name").value;

    const phone =
      document.getElementById("cust-phone").value;

    const password =
      document.getElementById("cust-password").value;

    if (!name || !phone || !password) {

      document.getElementById("cust-error")
        .textContent = "All fields required";

      return;
    }

    await createCustomerAccount({
      name,
      phone,
      password
    });

    location.hash = "customer-login";

  };

}