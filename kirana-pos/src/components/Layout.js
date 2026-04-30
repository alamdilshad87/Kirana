import { getCurrentUser } from "../auth/authService";
import { t } from "../i18n/i18n";

/* ── Status bar text ── */
export function buildSyncText(online) {
  return online
    ? `<span class="dot online"></span> ONLINE — SYNC ACTIVE`
    : `<span class="dot offline"></span> OFFLINE — LOCAL MODE`;
}

// PREMIUM SVG ICONS
const icons = {
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="11" width="7" height="10"></rect><rect x="3" y="15" width="7" height="6"></rect></svg>`,
  sale: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`,
  stock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>`,
  scanner: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><line x1="7" y1="12" x2="17" y2="12"></line><line x1="12" y1="7" x2="12" y2="17"></line></svg>`,
  reports: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
  credit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  ledger: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
  loan: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
  staff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
  coupons: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="10" rx="2"></rect><line x1="2" y1="12" x2="22" y2="12"></line></svg>`,
  audit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
  logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`
};

const navIcons = {
  dashboard: `<span class="nav-icon-wrap ic-dash">${icons.dashboard}</span>`,
  sale: `<span class="nav-icon-wrap ic-sale">${icons.sale}</span>`,
  stock: `<span class="nav-icon-wrap ic-stock">${icons.stock}</span>`,
  scanner: `<span class="nav-icon-wrap ic-scan">${icons.scanner}</span>`,
  reports: `<span class="nav-icon-wrap ic-rep">${icons.reports}</span>`,
  credit: `<span class="nav-icon-wrap ic-cred">${icons.credit}</span>`,
  ledger: `<span class="nav-icon-wrap ic-ledger">${icons.ledger}</span>`,
  loan: `<span class="nav-icon-wrap ic-loan">${icons.loan}</span>`,
  staff: `<span class="nav-icon-wrap ic-staff">${icons.staff}</span>`,
  coupons: `<span class="nav-icon-wrap ic-coup">${icons.coupons}</span>`,
  audit: `<span class="nav-icon-wrap ic-audit">${icons.audit}</span>`,
  settings: `<span class="nav-icon-wrap ic-set">${icons.settings}</span>`,
  logout: `<span class="nav-icon-wrap ic-log">${icons.logout}</span>`
};

export async function renderLayout(contentHtml) {
  const user      = await getCurrentUser();
  const role      = user?.role  || "owner";
  const name      = user?.name  || user?.username || "User";
  const isOwner   = role === "owner";
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
          <div class="sidebar-brand">
            <div class="sidebar-brand-icon">K</div>
            <div class="sidebar-brand-text">
              <span class="sidebar-brand-name">Kirana POS</span>
              <span class="sidebar-brand-sub">MANAGEMENT SYSTEM</span>
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

        <div class="lang-switch">
          <button data-lang="en">EN</button>
          <button data-lang="hi">हिं</button>
          <button data-lang="hing">HING</button>
        </div>

        <nav id="sidebar-nav">
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
        <main class="main-content">
          <div id="toast-container"></div>
          ${contentHtml}
        </main>
      </div>
    </div>

    <style>
      /* SIDEBAR INTERNAL STYLES */
      .nav-icon-wrap {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 14px;
        flex-shrink: 0;
        transition: 0.2s;
      }
      .nav-icon-wrap svg { width: 18px; height: 18px; stroke: currentColor; }
      
      /* Color logic */
      .ic-dash { color: #22c55e; background: rgba(34,197,94,0.1); }
      .ic-sale { color: #3b82f6; background: rgba(59,130,246,0.1); }
      .ic-stock { color: #f59e0b; background: rgba(245,158,11,0.1); }
      .ic-scan { color: #8b5cf6; background: rgba(139,92,246,0.1); }
      .ic-rep { color: #14b8a6; background: rgba(20,184,166,0.1); }
      .ic-cred { color: #eab308; background: rgba(234,179,8,0.1); }
      .ic-ledger { color: #f97316; background: rgba(249,115,22,0.1); }
      .ic-loan { color: #22c55e; background: rgba(34,197,94,0.1); }
      .ic-staff { color: #6366f1; background: rgba(99,102,241,0.1); }
      .ic-coup { color: #ec4899; background: rgba(236,72,153,0.1); }
      .ic-audit { color: #64748b; background: rgba(100,116,139,0.1); }
      .ic-set { color: #94a3b8; background: rgba(148,163,184,0.1); }
      .ic-log { color: #ef4444; background: rgba(239,68,68,0.1); }

      .sidebar nav a, .drawer-panel a {
        display: flex;
        align-items: center;
        padding: 10px 14px;
        margin: 4px 16px;
        color: #94a3b8;
        font-size: 14px;
        font-weight: 600;
        border-radius: 12px;
        text-decoration: none;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .sidebar nav a:hover, .drawer-panel a:hover {
        background: rgba(255,255,255,0.05);
        color: #fff;
        transform: translateX(4px);
      }
      .sidebar nav a.active, .drawer-panel a.active {
        background: rgba(34,197,94,0.12);
        color: #22c55e;
      }
      .logout-link:hover { background: rgba(239,68,68,0.1) !important; color: #ef4444 !important; }
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
      btn.onclick = () => {
        document.querySelectorAll(".lang-switch button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        setLanguage(btn.dataset.lang);
      };
    });
  });
}
