import { renderLayout } from "../components/Layout";
import { getAllSales } from "../services/db";
import { calculateMerchantHealthIndex } from "../services/healthIndex";
import { animateNumber } from "../utils/animateNumber";
import { getTodayProfit } from "../services/profit";
import { generateSmartInsights } from "../services/insights";
import { getDailySummary } from "../services/dailySummary";
import { renderDailySummary } from "../components/DailySummaryModal";
import { t } from "../i18n/i18n";

const icons = {
  sales: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  orders: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  profit: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
  health: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`
};

export async function renderDashboard() {
  const sales          = await getAllSales();
  const itemSales      = sales.filter(s => s.accountType === "ITEM_SALE" || s.accountType === "QUICK_SALE");
  const totalSales     = itemSales.reduce((s, x) => s + (x.amount || 0), 0);
  const transactionCount = itemSales.length;
  const todayProfit    = await getTodayProfit();
  const mhi            = await calculateMerchantHealthIndex();
  const insights       = await generateSmartInsights();

  const mhiColor = mhi.score >= 70 ? "#22c55e" : mhi.score >= 40 ? "#f59e0b" : "#ef4444";

  const content = `
    <section class="dashboard">
      <div class="page-header">
        <div>
          <h1>Dashboard</h1>
          <p class="page-subtitle">Real-time store performance overview</p>
        </div>
        <button id="view-summary" class="btn-formal-secondary" style="padding:10px 20px; font-size:13px;">
          View Daily Summary
        </button>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon-formal" style="color:#22c55e">${icons.sales}</div>
          <div class="kpi-body">
            <p class="kpi-label">${t("dashboard.totalSales")}</p>
            <h2 class="kpi-value" data-val="${totalSales}">₹${totalSales}</h2>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-formal" style="color:#6366f1">${icons.orders}</div>
          <div class="kpi-body">
            <p class="kpi-label">${t("dashboard.transactions")}</p>
            <h2 class="kpi-value" data-val="${transactionCount}">${transactionCount}</h2>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-formal" style="color:#14b8a6">${icons.profit}</div>
          <div class="kpi-body">
            <p class="kpi-label">${t("dashboard.todayProfit")}</p>
            <h2 class="kpi-value" data-val="${todayProfit}">₹${todayProfit}</h2>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-formal" style="color:${mhiColor}">${icons.health}</div>
          <div class="kpi-body">
            <p class="kpi-label">${t("dashboard.creditHealth")}</p>
            <h2 class="kpi-value" style="color:${mhiColor}" data-val="${mhi.score}">${mhi.score}</h2>
            <span class="kpi-badge" style="background:${mhiColor}22; color:${mhiColor}; border:1px solid ${mhiColor}44">${mhi.label}</span>
          </div>
        </div>

        <div class="kpi-card kpi-card--insights">
          <div class="kpi-body">
            <p class="kpi-label">Intelligent Insights</p>
            <ul class="insights-list">
              ${insights.map(i => `<li>${i}</li>`).join("")}
            </ul>
          </div>
        </div>
      </div>
    </section>

    <style>
      .kpi-icon-formal {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: rgba(255,255,255,0.03);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
        border: 1px solid rgba(255,255,255,0.06);
      }
      .kpi-badge {
        font-size: 10px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 4px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    </style>
  `;

  document.querySelector(".main-content").innerHTML = content;

  document.getElementById("view-summary").onclick = async () => {
    const summary = await getDailySummary();
    document.body.insertAdjacentHTML("beforeend", renderDailySummary(summary));
    document.getElementById("close-summary").onclick = () => {
      document.querySelector(".daily-summary-overlay").remove();
    };
  };

  document.querySelectorAll(".kpi-value[data-val]").forEach(el => {
    const v = parseInt(el.dataset.val.replace(/\D/g, ""));
    if (!isNaN(v) && v > 0) animateNumber(el, v);
  });
}