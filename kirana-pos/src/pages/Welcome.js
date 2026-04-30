import { navigate } from "../app";

export default async function renderWelcome() {
  const container = document.getElementById("app");
  
  const content = `
    <div class="welcome-page">
      <div class="welcome-bg">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
      </div>

      <div class="welcome-card glass-card">
        <h1 class="welcome-title">Kirana Intelligence</h1>
        <p class="welcome-subtitle">Professional Commerce OS</p>

        <div class="welcome-features">
          <div class="welcome-feature">Inventory</div>
          <div class="welcome-feature">Analytics</div>
          <div class="welcome-feature">AI Scan</div>
          <div class="welcome-feature">Offline</div>
        </div>

        <div class="welcome-divider"></div>

        <div class="welcome-actions">
          <button class="welcome-btn welcome-btn-primary" data-page="login">
            Shop Login
          </button>

          <button class="welcome-btn welcome-btn-secondary" data-page="owner-setup">
            Register Shop
          </button>

          <button class="welcome-btn welcome-btn-ghost" data-page="customer-login">
            Customer Login
          </button>
        </div>

        <p class="welcome-footer">Powered by Kirana POS &copy; 2026</p>
      </div>
    </div>

    <style id="welcome-styles">
      .welcome-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #080d1a;
        position: relative;
        overflow: hidden;
        padding: 20px;
        font-family: 'Inter', sans-serif;
      }

      .welcome-bg { position: absolute; inset: 0; pointer-events: none; }
      .blob { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.1; }
      .blob-1 { width: 600px; height: 600px; background: #22c55e; top: -200px; left: -200px; }
      .blob-2 { width: 500px; height: 500px; background: #6366f1; bottom: -150px; right: -150px; }

      .welcome-card {
        position: relative;
        z-index: 2;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 32px;
        padding: 64px 48px;
        width: 100%;
        max-width: 440px;
        text-align: center;
        backdrop-filter: blur(32px);
        box-shadow: 0 40px 100px rgba(0,0,0,0.6);
      }

      .welcome-title {
        font-size: 32px;
        font-weight: 800;
        letter-spacing: -1.5px;
        margin: 0 0 8px;
        color: #fff;
      }

      .welcome-subtitle {
        font-size: 13px;
        color: #64748b;
        margin: 0 0 40px;
        text-transform: uppercase;
        letter-spacing: 2px;
        font-weight: 600;
      }

      .welcome-features {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-bottom: 40px;
        flex-wrap: wrap;
      }

      .welcome-feature {
        padding: 6px 14px;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 99px;
        font-size: 11px;
        color: #94a3b8;
        font-weight: 600;
      }

      .welcome-divider {
        height: 1px;
        background: rgba(255,255,255,0.08);
        margin: 0 0 32px;
      }

      .welcome-actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .welcome-btn {
        padding: 16px;
        border: none;
        border-radius: 16px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .welcome-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      }

      .welcome-btn-primary {
        background: #22c55e;
        color: #fff;
      }

      .welcome-btn-secondary {
        background: rgba(255,255,255,0.08);
        color: #fff;
        border: 1px solid rgba(255,255,255,0.1);
      }

      .welcome-btn-ghost {
        background: transparent;
        color: #64748b;
        font-size: 13px;
      }

      .welcome-footer {
        margin-top: 40px;
        font-size: 11px;
        color: #475569;
      }
    </style>
  `;

  container.innerHTML = content;

  document.querySelectorAll(".welcome-btn").forEach(btn => {
    btn.onclick = () => {
      const page = btn.dataset.page;
      navigate(page);
    };
  });
}