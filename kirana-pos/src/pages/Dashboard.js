import { renderLayout } from "../components/Layout";
import { getAllSales } from "../services/db";
import { calculateMerchantHealthIndex } from "../services/healthIndex";
import { animateNumber } from "../utils/animateNumber";
import { getTodayProfit } from "../services/profit";
import { generateSmartInsights } from "../services/insights";
import { getDailySummary } from "../services/dailySummary";
import { renderDailySummary } from "../components/DailySummaryModal";
import { t } from "../i18n/i18n";

const kpiIcons = {
  sales: `<div class="kpi-icon-square" style="background:rgba(245,158,11,0.15);color:#f59e0b">💰</div>`,
  orders: `<div class="kpi-icon-square" style="background:rgba(59,130,246,0.15);color:#3b82f6">📋</div>`,
  credit: `<div class="kpi-icon-square" style="background:rgba(100,116,139,0.15);color:#64748b">💳</div>`,
  profit: `<div class="kpi-icon-square" style="background:rgba(34,197,94,0.15);color:#22c55e">📈</div>`,
  health: `<div class="kpi-icon-square" style="background:rgba(234,179,8,0.15);color:#eab308">⭐</div>`,
  bot: `<div class="insight-bot-icon">🤖</div>`
};

export async function renderDashboard() {
  const sales          = await getAllSales();
  const itemSales      = sales.filter(s => s.accountType === "ITEM_SALE" || s.accountType === "QUICK_SALE");
  const creditSales    = itemSales.filter(s => s.paymentMethod === "credit").reduce((s, x) => s + (x.amount || 0), 0);
  const totalSales     = itemSales.reduce((s, x) => s + (x.amount || 0), 0);
  const transactionCount = itemSales.length;
  const todayProfit    = await getTodayProfit();
  const mhi            = await calculateMerchantHealthIndex();
  const insights       = await generateSmartInsights();

  const content = `
    <section class="dashboard">
      <div class="page-header-simple">
        <h1>Dashboard</h1>
        <p>Here's what's happening at your store today</p>
      </div>

      <div class="kpi-row">
        <div class="kpi-card-simple">
          ${kpiIcons.sales}
          <div class="kpi-info">
            <p class="kpi-label-small">TOTAL SALES</p>
            <h2 class="kpi-value-small">₹${totalSales}</h2>
          </div>
        </div>

        <div class="kpi-card-simple">
          ${kpiIcons.orders}
          <div class="kpi-info">
            <p class="kpi-label-small">TRANSACTIONS</p>
            <h2 class="kpi-value-small">${transactionCount}</h2>
          </div>
        </div>

        <div class="kpi-card-simple">
          ${kpiIcons.credit}
          <div class="kpi-info">
            <p class="kpi-label-small">CREDIT SALES</p>
            <h2 class="kpi-value-small">₹${creditSales}</h2>
          </div>
        </div>

        <div class="kpi-card-simple">
          ${kpiIcons.profit}
          <div class="kpi-info">
            <p class="kpi-label-small">TODAY'S PROFIT</p>
            <h2 class="kpi-value-small">₹${todayProfit}</h2>
          </div>
        </div>

        <div class="kpi-card-simple">
          ${kpiIcons.health}
          <div class="kpi-info">
            <p class="kpi-label-small">BUSINESS CREDIT HEALTH</p>
            <h2 class="kpi-value-small">${mhi.score}</h2>
            <span class="health-sub">No Activity</span>
          </div>
        </div>
      </div>

      <div class="insights-section glass-card">
        ${kpiIcons.bot}
        <div class="insights-content">
          <p class="insight-label">INSIGHTS</p>
          <div class="insight-bubble">
            ${insights.length > 0 ? insights[0] : "No sales recorded today. Try attracting customers with offers."}
          </div>
        </div>
      </div>
    </section>

    <style>
      .page-header-simple { margin-bottom: 32px; }
      .page-header-simple h1 { font-size: 28px; font-weight: 800; color: #fff; margin-bottom: 4px; }
      .page-header-simple p { font-size: 13px; color: #64748b; }

      .kpi-row { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
      .kpi-card-simple {
        flex: 1;
        min-width: 200px;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 16px;
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .kpi-icon-square {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      }
      .kpi-label-small { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
      .kpi-value-small { font-size: 20px; font-weight: 800; color: #fff; }
      .health-sub { font-size: 10px; color: #475569; background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px; margin-top: 4px; display: inline-block; }

      .insights-section {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        padding: 24px;
        background: rgba(255,255,255,0.02);
      }
      .insight-bot-icon {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: rgba(139,92,246,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        flex-shrink: 0;
      }
      .insight-label { font-size: 10px; font-weight: 800; color: #64748b; margin-bottom: 8px; letter-spacing: 1px; }
      .insight-bubble {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 12px;
        padding: 12px 16px;
        color: #94a3b8;
        font-size: 13px;
        line-height: 1.5;
        max-width: 400px;
      }
    </style>
  `;

  document.querySelector(".main-content").innerHTML = content;
}