import { getCurrentUser } from "../auth/authService";
import { t } from "../i18n/i18n";

/* ── Status bar text ── */
export function buildSyncText(online) {
  return online
    ? `<span class="dot online"></span> Online &mdash; Cloud sync active`
    : `<span class="dot offline"></span> Offline &mdash; Working locally`;
}

const navIcons = {
  dashboard: `<span class="nav-icon-wrap" style="background:rgba(34,197,94,0.15);color:#22c55e">📊</span>`,
  sale: `<span class="nav-icon-wrap" style="background:rgba(59,130,246,0.15);color:#3b82f6">🛍️</span>`,
  stock: `<span class="nav-icon-wrap" style="background:rgba(245,158,11,0.15);color:#f59e0b">📦</span>`,
  scanner: `<span class="nav-icon-wrap" style="background:rgba(139,92,246,0.15);color:#8b5cf6">📷</span>`,
  reports: `<span class="nav-icon-wrap" style="background:rgba(20,184,166,0.15);color:#14b8a6">📈</span>`,
  credit: `<span class="nav-icon-wrap" style="background:rgba(234,179,8,0.15);color:#eab308">⭐</span>`,
  ledger: `<span class="nav-icon-wrap" style="background:rgba(249,115,22,0.15);color:#f97316">📒</span>`,
  loan: `<span class="nav-icon-wrap" style="background:rgba(34,197,94,0.15);color:#22c55e">💸</span>`,
  staff: `<span class="nav-icon-wrap" style="background:rgba(99,102,241,0.15);color:#6366f1">👥</span>`,
  coupons: `<span class="nav-icon-wrap" style="background:rgba(236,72,153,0.15);color:#ec4899">🎟️</span>`,
  audit: `<span class="nav-icon-wrap" style="background:rgba(100,116,139,0.15);color:#64748b">🔍</span>`,
  settings: `<span class="nav-icon-wrap" style="background:rgba(255,255,255,0.1);color:#fff">⚙️</span>`,
  logout: `<span class="nav-icon-wrap" style="background:rgba(239,68,68,0.15);color:#ef4444">🚪</span>`
};

export async function renderLayout(contentHtml) {
  const user      = await getCurrentUser();
  const role      = user?.role  || "owner";
  const name      = user?.name  || user?.username || "User";
  const isOwner   = role === "owner";
  const isManager = role === "manager";
  const isCashier = role === "cashier";
  const online    = navigator.onLine;

  const initials = name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() || "U";

  const links = `
    <a href="#" data-page="dashboard">${navIcons.dashboard}${t("sidebar.dashboard")}</a>
    <a href="#" data-page="add-sale">${navIcons.sale}${t("sidebar.addSale")}</a>

    ${!isCashier ? `
    <div class="sidebar-divider"></div>
    <a href="#" data-page="stock">${navIcons.stock}${t("sidebar.stock")}</a>
    <a href="#" data-page="bill-scanner">${navIcons.scanner}AI Bill Scanner</a>
    ` : ""}

    ${!isCashier ? `
    <div class="sidebar-divider"></div>
    <a href="#" data-page="reports">${navIcons.reports}${t("sidebar.reports")}</a>
    <a href="#" data-page="credit">${navIcons.credit}${t("sidebar.creditScore")}</a>
    <a href="#" data-page="ledger">${navIcons.ledger}${t("sidebar.creditLedger")}</a>
    <a href="#" data-page="credit-loan">${navIcons.loan}${t("sidebar.creditLoan")}</a>
    ` : ""}

    ${isOwner ? `
    <div class="sidebar-divider"></div>
    <a href="#" data-page="manage-staff">${navIcons.staff}${t("sidebar.manageStaff")}</a>
    <a href="#" data-page="coupon-manager">${navIcons.coupons}${t("sidebar.coupons")}</a>
    <a href="#" data-page="audit-log">${navIcons.audit}${t("sidebar.auditLog")}</a>
    <a href="#" data-page="shop-settings">${navIcons.settings}${t("sidebar.shopSettings")}</a>
    ` : ""}

    <div class="sidebar-divider"></div>
    <a href="#" data-page="logout" class="logout-link">${navIcons.logout}${t("sidebar.logout")}</a>
  `;

  return `
    <div class="app-layout">
      <div class="mobile-header">
        <button id="menu-toggle" class="menu-btn">☰</button>
        <div class="app-title">KIRANA POS</div>
        <div class="sync-mini" id="sync-mini-dot">${online ? "🟢" : "🟠"}</div>
      </div>

      <div id="mobile-drawer" class="mobile-drawer">
        <div class="drawer-panel">
          <div class="sidebar-brand" style="padding: 20px 0;">
            <div class="sidebar-brand-icon">K</div>
            <div class="sidebar-brand-text">
              <span class="sidebar-brand-name">Kirana POS</span>
            </div>
          </div>
          <div id="drawer-links">${links}</div>
        </div>
      </div>

      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="sidebar-brand-icon">K</div>
          <div class="sidebar-brand-text">
            <span class="sidebar-brand-name">Kirana POS</span>
            <span class="sidebar-brand-sub">MANAGEMENT SYSTEM</span>
          </div>
        </div>

        <nav>
          <div class="lang-switch">
            <button data-lang="en">EN</button>
            <button data-lang="hi">हिं</button>
            <button data-lang="hing">HING</button>
          </div>
          ${links}
        </nav>

        <div class="sidebar-user-footer">
          <div class="sidebar-user-avatar">${initials}</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">${name}</div>
            <div class="sidebar-user-role">${role}</div>
          </div>
        </div>
      </aside>

      <div class="app-right-panel">
        <div class="sync-status" id="sync-status">${buildSyncText(online)}</div>
        <main class="main-content page-enter">
          <div id="toast-container"></div>
          ${contentHtml}
        </main>
      </div>
    </div>

    <style>
      .nav-icon-wrap {
        width: 24px;
        height: 24px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        margin-right: 12px;
        flex-shrink: 0;
      }
      .sidebar a, .drawer-panel a {
        display: flex;
        align-items: center;
        padding: 10px 16px;
        color: #94a3b8;
        font-size: 13px;
        font-weight: 500;
        border-radius: 8px;
        margin: 2px 0;
        transition: all 0.2s;
        text-decoration: none;
      }
      .sidebar a:hover, .drawer-panel a:hover {
        background: rgba(255,255,255,0.05);
        color: #fff;
      }
      .sidebar a.active, .drawer-panel a.active {
        background: rgba(34,197,94,0.1);
        color: #22c55e;
      }
      .sidebar-brand-sub {
        font-size: 9px;
        color: #64748b;
        letter-spacing: 1px;
      }
    </style>
  `;
}

export function updateNetworkBadge(online) {
  const bar = document.getElementById("sync-status");
  const mini = document.getElementById("sync-mini-dot");
  if (bar) bar.innerHTML = buildSyncText(online);
  if (mini) mini.textContent = online ? "🟢" : "🟠";
}

export function attachLayoutEvents() {
  import("../i18n/i18n.js").then(({ setLanguage }) => {
    document.querySelectorAll(".lang-switch button").forEach(btn => {
      btn.onclick = () => setLanguage(btn.dataset.lang);
    });
  });
}
