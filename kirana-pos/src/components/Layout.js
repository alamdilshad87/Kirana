import { getCurrentUser } from "../auth/authService";
import { t } from "../i18n/i18n";

/* ── Status bar text ── */
export function buildSyncText(online) {
  return online
    ? `<span class="dot online"></span> Online &mdash; Cloud sync active`
    : `<span class="dot offline"></span> Offline &mdash; Working locally`;
}

const icons = {
  dashboard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
  sale: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`,
  stock: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
  finance: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  staff: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  settings: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
  logout: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>`
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

  return `
    <div class="app-layout">
      <div class="mobile-header">
        <button id="menu-toggle" class="menu-btn">☰</button>
        <div class="app-title">KIRANA POS</div>
        <div class="sync-mini" id="sync-mini-dot">${online ? "🟢" : "🟠"}</div>
      </div>

      <div id="mobile-drawer" class="mobile-drawer">
        <div class="drawer-panel"><div id="drawer-links"></div></div>
      </div>

      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="sidebar-brand-icon">K</div>
          <div class="sidebar-brand-text">
            <span class="sidebar-brand-name">Kirana POS</span>
            <span class="sidebar-brand-sub">Management System</span>
          </div>
        </div>

        <nav>
          <div class="lang-switch">
            <button data-lang="en">EN</button>
            <button data-lang="hi">हिं</button>
            <button data-lang="hing">HING</button>
          </div>

          <div class="nav-section-label">Main</div>
          <a href="#" data-page="dashboard"><span class="nav-icon">${icons.dashboard}</span>${t("sidebar.dashboard")}</a>
          <a href="#" data-page="add-sale"><span class="nav-icon">${icons.sale}</span>${t("sidebar.addSale")}</a>

          ${!isCashier ? `
          <div class="sidebar-divider"></div>
          <div class="nav-section-label">Inventory</div>
          <a href="#" data-page="stock"><span class="nav-icon">${icons.stock}</span>${t("sidebar.stock")}</a>
          <a href="#" data-page="bill-scanner"><span class="nav-icon">${icons.dashboard}</span>AI Scanner</a>
          ` : ""}

          ${!isCashier ? `
          <div class="sidebar-divider"></div>
          <div class="nav-section-label">Finance</div>
          <a href="#" data-page="reports"><span class="nav-icon">${icons.finance}</span>${t("sidebar.reports")}</a>
          <a href="#" data-page="credit"><span class="nav-icon">${icons.finance}</span>${t("sidebar.creditScore")}</a>
          <a href="#" data-page="ledger"><span class="nav-icon">${icons.finance}</span>${t("sidebar.creditLedger")}</a>
          ` : ""}

          ${isOwner ? `
          <div class="sidebar-divider"></div>
          <div class="nav-section-label">Admin</div>
          <a href="#" data-page="manage-staff"><span class="nav-icon">${icons.staff}</span>${t("sidebar.manageStaff")}</a>
          <a href="#" data-page="shop-settings"><span class="nav-icon">${icons.settings}</span>${t("sidebar.shopSettings")}</a>
          ` : ""}

          <div class="sidebar-divider"></div>
          <a href="#" data-page="logout" class="logout-link"><span class="nav-icon">${icons.logout}</span>${t("sidebar.logout")}</a>
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
