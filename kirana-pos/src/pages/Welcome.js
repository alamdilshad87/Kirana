export default function Welcome() {

  return `
    <div class="welcome-page">

      <!-- Animated background blobs -->
      <div class="welcome-bg">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
        <div class="blob blob-3"></div>
      </div>

      <div class="welcome-card">

        <!-- Logo + Brand -->
        <h1 class="welcome-title">Kirana Intelligence</h1>
        <p class="welcome-subtitle">Professional Commerce Operating System</p>

        <!-- Features row -->
        <div class="welcome-features">
          <div class="welcome-feature">
            <span>Inventory</span>
          </div>
          <div class="welcome-feature">
            <span>Analytics</span>
          </div>
          <div class="welcome-feature">
            <span>AI Scan</span>
          </div>
          <div class="welcome-feature">
            <span>Offline</span>
          </div>
        </div>

        <div class="welcome-divider"></div>

        <!-- CTAs -->
        <div class="welcome-actions">
          <button class="welcome-btn welcome-btn-primary" data-page="login">
            Management Portal
          </button>

          <button class="welcome-btn welcome-btn-secondary" data-page="owner-setup">
            Register Institution
          </button>

          <button class="welcome-btn welcome-btn-ghost" data-page="customer-login">
            Customer Interface
          </button>
        </div>

        <p class="welcome-footer">
          Works offline · Your data stays private · No subscription
        </p>

      </div>

    </div>

    <style id="welcome-styles">
      .welcome-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #06080c;
        position: relative;
        overflow: hidden;
        padding: 20px;
        font-family: 'Inter', sans-serif;
      }

      .welcome-bg { position: absolute; inset: 0; pointer-events: none; }
      .blob { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.08; }
      .blob-1 { width: 600px; height: 600px; background: #22c55e; top: -200px; left: -200px; }
      .blob-2 { width: 500px; height: 500px; background: #6366f1; bottom: -150px; right: -150px; }

      .welcome-card {
        position: relative;
        z-index: 2;
        background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 24px;
        padding: 64px 48px;
        width: 100%;
        max-width: 440px;
        text-align: center;
        backdrop-filter: blur(32px);
        box-shadow: 0 40px 100px rgba(0,0,0,0.5);
      }

      .welcome-title {
        font-size: 28px;
        font-weight: 700;
        letter-spacing: -1px;
        margin: 0 0 8px;
        color: #fff;
      }

      .welcome-subtitle {
        font-size: 14px;
        color: #64748b;
        margin: 0 0 40px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .welcome-features {
        display: flex;
        justify-content: center;
        gap: 12px;
        margin-bottom: 40px;
      }

      .welcome-feature {
        padding: 8px 16px;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 99px;
        font-size: 11px;
        color: #94a3b8;
        font-weight: 600;
      }

      .welcome-divider {
        height: 1px;
        background: rgba(255,255,255,0.06);
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
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .welcome-btn-primary {
        background: #22c55e;
        color: #fff;
      }

      .welcome-btn-secondary {
        background: rgba(255,255,255,0.05);
        color: #fff;
        border: 1px solid rgba(255,255,255,0.1);
      }

      .welcome-btn-ghost {
        background: transparent;
        color: #64748b;
        font-size: 12px;
      }

      .welcome-footer {
        margin-top: 32px;
        font-size: 11px;
        color: #334155;
      }
    </style>
  `;

}