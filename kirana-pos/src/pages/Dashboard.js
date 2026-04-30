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
        <p>Real-time analytics for your business</p>
      </div>

      <div class="kpi-grid">
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
            <p class="kpi-label-small">CREDIT HEALTH</p>
            <h2 class="kpi-value-small">${mhi.score}</h2>
          </div>
        </div>
      </div>

      <div class="insights-section glass-card">
        ${kpiIcons.bot}
        <div class="insights-content">
          <p class="insight-label">AI INSIGHTS</p>
          <div class="insight-bubble">
            ${insights.length > 0 ? insights[0] : "No sales data available for today. Complete more transactions to see insights."}
          </div>
        </div>
      </div>
    </section>

    <style>
      .page-header-simple { margin-bottom: 32px; }
      .page-header-simple h1 { font-size: 28px; font-weight: 800; color: #fff; margin-bottom: 4px; }
      .page-header-simple p { font-size: 13px; color: #64748b; }

      .kpi-grid { 
        display: grid; 
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); 
        gap: 20px; 
        margin-bottom: 32px; 
      }
      
      .kpi-card-simple {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 20px;
        padding: 24px;
        display: flex;
        align-items: center;
        gap: 16px;
        transition: transform 0.2s ease;
      }
      .kpi-card-simple:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.12); }
      
      .kpi-icon-square {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        flex-shrink: 0;
      }
      .kpi-label-small { font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
      .kpi-value-small { font-size: 22px; font-weight: 800; color: #fff; }

      .insights-section {
        display: flex;
        align-items: flex-start;
        gap: 20px;
        padding: 32px;
        background: rgba(139,92,246,0.03);
        border: 1px solid rgba(139,92,246,0.1);
      }
      .insight-bot-icon {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        background: rgba(139,92,246,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        flex-shrink: 0;
      }
      .insight-label { font-size: 11px; font-weight: 800; color: #8b5cf6; margin-bottom: 12px; letter-spacing: 1.2px; }
      .insight-bubble {
        color: #e2e8f0;
        font-size: 14px;
        line-height: 1.6;
        max-width: 600px;
      }
    </style>
  `;

  document.querySelector(".main-content").innerHTML = content;
}