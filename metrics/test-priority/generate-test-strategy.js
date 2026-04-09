// ============================================================
//  TEST STRATEGY REPORT GENERATOR
//  Edit the CONFIG block below, then run:
//    node generate-test-strategy.js
//  Output: test-strategy-report.html
// ============================================================

const fs = require('fs');

// ============================================================
//  CONFIG — edit everything here
// ============================================================

const META = {
  product: 'Checkout Service',
  version: '3.2',
  owner: 'Maria Silva',
  updatedAt: '2024-01-29',
  reviewCycle: 'quarterly',
};

const OBJECTIVE = {
  // What the strategy covers
  summary: `This strategy defines HOW we guarantee the quality of the ${META.product},
covering everything from unit-level features to production performance.`,
  // What is explicitly out of scope
  outOfScope: 'Security testing (pentest) and accessibility — those have separate strategies.',
};

const PYRAMID = [
  // { level, current (%), target (%), tools }
  { level: 'Unit', current: 45, target: 60, tools: 'Jest, Vitest' },
  { level: 'Integration/API', current: 25, target: 30, tools: 'Supertest, Pact, k6' },
  { level: 'E2E/UI', current: 30, target: 10, tools: 'Playwright' },
];

const AUTOMATION = {
  automate: [
    'Risk score > 10 (impact × probability)',
    'Flow executed more than once per sprint',
    'Manual regression cost > 30 min',
  ],
  doNotAutomate: [
    'Risk score < 5',
    'Feature will change next sprint',
    'Test would be more fragile than the value it delivers',
  ],
};

// sim | nao | semanal | mensal  →  yes | no | weekly | monthly
const ENVIRONMENTS = [
  // { name, smoke, regression, performance, contract }
  { name: 'Develop', smoke: 'yes', regression: 'yes', performance: 'no', contract: 'yes' },
  { name: 'Staging', smoke: 'yes', regression: 'yes', performance: 'weekly', contract: 'yes' },
  { name: 'Production', smoke: 'yes', regression: 'no', performance: 'monthly', contract: 'no' },
];

const RELEASE_CRITERIA = {
  blocking: [
    '100% of smoke tests passing',
    '0 open critical bugs',
    'k6 p95 < 1s on checkout APIs',
    'Pact contract approved (consumer + provider)',
  ],
  recommended: [
    'Escape rate < 10% in the sprint',
    'Unit coverage > 60%',
  ],
};

const RESPONSIBILITIES = [
  // { area, owner }
  { area: 'Unit tests', owner: 'Dev + QA review' },
  { area: 'Integration/API tests', owner: 'QA' },
  { area: 'Critical E2E', owner: 'QA' },
  { area: 'Performance baseline', owner: 'QA' },
  { area: 'Pact contract', owner: 'QA + Dev' },
  { area: 'Quality metrics', owner: 'QA Lead' },
];

const IMPROVEMENTS = [
  'Reduce E2E from 30% to 10% — replace with integration tests',
  'Add Pact for the 3 microservices still without a contract',
  'Implement synthetic monitoring in production with Playwright',
];

// ============================================================
//  HELPERS
// ============================================================

const fmt = (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const statusClass = (current, target) => {
  if (current === target) return 'ok';
  if (Math.abs(current - target) <= 5) return 'warn';
  return 'bad';
};

const envBadge = (val) => {
  const v = val.toLowerCase();
  if (v === 'yes' || v === 'weekly' || v === 'monthly') return `<span class="badge badge-ok">${val}</span>`;
  return `<span class="badge badge-no">${val}</span>`;
};

const pyramidBar = (row) => {
  const cls = statusClass(row.current, row.target);
  const colorMap = { ok: '#1D9E75', warn: '#BA7517', bad: '#E24B4A' };
  const color = colorMap[cls];
  return `
    <div class="pyr-row">
      <div class="pyr-label">${row.level}</div>
      <div class="pyr-bars">
        <div class="pyr-bar-wrap">
          <div class="pyr-bar" style="width:${row.current}%;background:${color}"></div>
          <span class="pyr-pct" style="color:${color}">${row.current}%</span>
        </div>
        <div class="pyr-bar-wrap">
          <div class="pyr-bar" style="width:${row.target}%;background:#B4B2A9;opacity:.5"></div>
          <span class="pyr-pct" style="color:#888780">${row.target}%</span>
        </div>
      </div>
      <div class="pyr-tools">${row.tools}</div>
    </div>`;
};

// ============================================================
//  HTML TEMPLATE
// ============================================================

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Test Strategy — ${META.product} v${META.version}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:      #ffffff;
    --bg2:     #f5f4f0;
    --bg3:     #eeedea;
    --border:  rgba(0,0,0,.12);
    --border2: rgba(0,0,0,.22);
    --text:    #1a1a18;
    --muted:   #5f5e5a;
    --hint:    #888780;
    --ok-bg:   #e1f5ee; --ok-fg:   #085041;
    --warn-bg: #faeeda; --warn-fg: #633806;
    --bad-bg:  #fcebeb; --bad-fg:  #791f1f;
    --info-bg: #e6f1fb; --info-fg: #0c447c;
    --accent:  #185FA5;
    --r-md: 8px; --r-lg: 12px;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg:      #1e1e1c;
      --bg2:     #2a2a28;
      --bg3:     #343432;
      --border:  rgba(255,255,255,.12);
      --border2: rgba(255,255,255,.22);
      --text:    #e8e6de;
      --muted:   #b4b2a9;
      --hint:    #888780;
      --ok-bg:   #04342c; --ok-fg:   #9fe1cb;
      --warn-bg: #412402; --warn-fg: #fac775;
      --bad-bg:  #501313; --bad-fg:  #f09595;
      --info-bg: #042c53; --info-fg: #b5d4f4;
      --accent:  #85b7eb;
    }
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: var(--text);
    background: var(--bg3);
    padding: 2rem 1rem;
  }
  .page {
    max-width: 860px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  /* ---- header ---- */
  .header {
    background: var(--bg);
    border: 0.5px solid var(--border);
    border-radius: var(--r-lg);
    padding: 1.5rem 1.75rem;
  }
  .header h1 { font-size: 20px; font-weight: 500; margin-bottom: 6px; }
  .header-meta { font-size: 12px; color: var(--muted); display: flex; flex-wrap: wrap; gap: 4px 16px; }
  .header-meta span { display: flex; align-items: center; gap: 4px; }
  /* ---- section cards ---- */
  .card {
    background: var(--bg);
    border: 0.5px solid var(--border);
    border-radius: var(--r-lg);
    padding: 1.25rem 1.5rem;
  }
  .section-num {
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: .06em;
    color: var(--accent);
    margin-bottom: 4px;
  }
  .section-title {
    font-size: 15px;
    font-weight: 500;
    margin-bottom: 1rem;
    color: var(--text);
  }
  /* ---- objective ---- */
  .obj-text { font-size: 13px; color: var(--text); line-height: 1.7; margin-bottom: .75rem; }
  .obj-outofscope {
    background: var(--bg2);
    border-left: 3px solid var(--border2);
    border-radius: 0 var(--r-md) var(--r-md) 0;
    padding: .6rem .9rem;
    font-size: 12px;
    color: var(--muted);
  }
  .obj-outofscope strong { color: var(--text); font-weight: 500; }
  /* ---- pyramid ---- */
  .pyr-legend { display: flex; gap: 16px; font-size: 11px; color: var(--muted); margin-bottom: .75rem; }
  .pyr-legend span { display: flex; align-items: center; gap: 5px; }
  .dot { width: 8px; height: 8px; border-radius: 2px; }
  .pyr-row { display: grid; grid-template-columns: 130px 1fr 160px; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 0.5px solid var(--border); }
  .pyr-row:last-child { border-bottom: none; }
  .pyr-label { font-size: 12px; font-weight: 500; }
  .pyr-bars { display: flex; flex-direction: column; gap: 4px; }
  .pyr-bar-wrap { display: flex; align-items: center; gap: 6px; }
  .pyr-bar { height: 6px; border-radius: 3px; min-width: 2px; }
  .pyr-pct { font-size: 11px; font-weight: 500; min-width: 30px; }
  .pyr-tools { font-size: 11px; color: var(--muted); }
  /* ---- automation ---- */
  .auto-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .auto-box { border-radius: var(--r-md); padding: .85rem 1rem; }
  .auto-box.do   { background: var(--ok-bg); }
  .auto-box.dont { background: var(--bad-bg); }
  .auto-title { font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: .05em; margin-bottom: .5rem; }
  .auto-box.do   .auto-title { color: var(--ok-fg); }
  .auto-box.dont .auto-title { color: var(--bad-fg); }
  .auto-item { font-size: 12px; display: flex; gap: 6px; padding: 3px 0; }
  .auto-box.do   .auto-item { color: var(--ok-fg); }
  .auto-box.dont .auto-item { color: var(--bad-fg); }
  .auto-icon { width: 14px; flex-shrink: 0; margin-top: 1px; }
  /* ---- tables ---- */
  table { width: 100%; border-collapse: collapse; font-size: 12px; table-layout: fixed; }
  th { text-align: left; padding: 7px 10px; font-size: 11px; font-weight: 500; color: var(--hint); text-transform: uppercase; letter-spacing: .04em; border-bottom: 0.5px solid var(--border2); }
  td { padding: 9px 10px; border-bottom: 0.5px solid var(--border); color: var(--text); vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  .badge { display: inline-flex; align-items: center; font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 20px; }
  .badge-ok { background: var(--ok-bg); color: var(--ok-fg); }
  .badge-no { background: var(--bg2); color: var(--muted); }
  /* ---- release criteria ---- */
  .criteria-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .criteria-box { border-radius: var(--r-md); padding: .85rem 1rem; }
  .criteria-box.block { background: var(--bad-bg); }
  .criteria-box.rec   { background: var(--warn-bg); }
  .criteria-title { font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: .05em; margin-bottom: .5rem; }
  .criteria-box.block .criteria-title { color: var(--bad-fg); }
  .criteria-box.rec   .criteria-title { color: var(--warn-fg); }
  .criteria-item { font-size: 12px; display: flex; gap: 6px; padding: 3px 0; }
  .criteria-box.block .criteria-item { color: var(--bad-fg); }
  .criteria-box.rec   .criteria-item { color: var(--warn-fg); }
  /* ---- improvements ---- */
  .improvement-item { display: flex; gap: 10px; padding: 8px 0; border-bottom: 0.5px solid var(--border); align-items: flex-start; }
  .improvement-item:last-child { border-bottom: none; }
  .imp-num { width: 22px; height: 22px; border-radius: 50%; background: var(--info-bg); color: var(--info-fg); font-size: 11px; font-weight: 500; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
  .imp-text { font-size: 13px; color: var(--text); line-height: 1.5; }
  /* ---- footer ---- */
  .footer { text-align: center; font-size: 11px; color: var(--hint); padding: .5rem 0 1rem; }
  @media print {
    body { background: #fff; padding: .5rem; }
    .card, .header { border: 1px solid #ddd; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="header">
    <h1>Test Strategy &mdash; ${META.product} v${META.version}</h1>
    <div class="header-meta">
      <span>Owner: <strong>${META.owner}</strong></span>
      <span>Updated: <strong>${fmt(META.updatedAt)}</strong></span>
      <span>Review: <strong>${META.reviewCycle}</strong></span>
    </div>
  </div>

  <!-- 1. OBJECTIVE -->
  <div class="card">
    <div class="section-num">Section 1</div>
    <div class="section-title">Objective</div>
    <p class="obj-text">${OBJECTIVE.summary.replace(/\n/g, '<br>')}</p>
    <div class="obj-outofscope">
      <strong>Not covered:</strong> ${OBJECTIVE.outOfScope}
    </div>
  </div>

  <!-- 2. PYRAMID -->
  <div class="card">
    <div class="section-num">Section 2</div>
    <div class="section-title">Test pyramid &mdash; current vs target distribution</div>
    <div class="pyr-legend">
      <span><span class="dot" style="background:#1D9E75"></span>Current (on target)</span>
      <span><span class="dot" style="background:#BA7517"></span>Current (near target)</span>
      <span><span class="dot" style="background:#E24B4A"></span>Current (off target)</span>
      <span><span class="dot" style="background:#B4B2A9;opacity:.6"></span>Target</span>
    </div>
    ${PYRAMID.map(pyramidBar).join('')}
  </div>

  <!-- 3. AUTOMATION CRITERIA -->
  <div class="card">
    <div class="section-num">Section 3</div>
    <div class="section-title">Automation criteria</div>
    <div class="auto-grid">
      <div class="auto-box do">
        <div class="auto-title">Automate when</div>
        ${AUTOMATION.automate.map(i => `
        <div class="auto-item">
          <svg class="auto-icon" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" stroke-width="1"/>
            <path d="M4 7l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          ${i}
        </div>`).join('')}
      </div>
      <div class="auto-box dont">
        <div class="auto-title">Do not automate when</div>
        ${AUTOMATION.doNotAutomate.map(i => `
        <div class="auto-item">
          <svg class="auto-icon" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" stroke-width="1"/>
            <path d="M5 5l4 4M9 5l-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          ${i}
        </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- 4. ENVIRONMENTS -->
  <div class="card">
    <div class="section-num">Section 4</div>
    <div class="section-title">Environments &amp; coverage</div>
    <table>
      <thead>
        <tr>
          <th style="width:22%">Environment</th>
          <th style="width:19%">Smoke</th>
          <th style="width:19%">Regression</th>
          <th style="width:22%">Performance</th>
          <th style="width:18%">Contract</th>
        </tr>
      </thead>
      <tbody>
        ${ENVIRONMENTS.map(e => `
        <tr>
          <td><strong>${e.name}</strong></td>
          <td>${envBadge(e.smoke)}</td>
          <td>${envBadge(e.regression)}</td>
          <td>${envBadge(e.performance)}</td>
          <td>${envBadge(e.contract)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>

  <!-- 5. RELEASE CRITERIA -->
  <div class="card">
    <div class="section-num">Section 5</div>
    <div class="section-title">Release quality criteria</div>
    <div class="criteria-grid">
      <div class="criteria-box block">
        <div class="criteria-title">Blocking &mdash; deploy stops if not met</div>
        ${RELEASE_CRITERIA.blocking.map(i => `
        <div class="criteria-item">
          <svg class="auto-icon" viewBox="0 0 14 14" fill="none" style="width:14px;flex-shrink:0;margin-top:1px">
            <path d="M7 1L1 13h12L7 1z" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/>
            <path d="M7 6v3M7 10.5v.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
          ${i}
        </div>`).join('')}
      </div>
      <div class="criteria-box rec">
        <div class="criteria-title">Recommended &mdash; alert only</div>
        ${RELEASE_CRITERIA.recommended.map(i => `
        <div class="criteria-item">
          <svg class="auto-icon" viewBox="0 0 14 14" fill="none" style="width:14px;flex-shrink:0;margin-top:1px">
            <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1"/>
            <path d="M7 4v3M7 8.5v.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
          ${i}
        </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- 6. RESPONSIBILITIES -->
  <div class="card">
    <div class="section-num">Section 6</div>
    <div class="section-title">Responsibilities</div>
    <table>
      <thead>
        <tr>
          <th style="width:55%">Area</th>
          <th style="width:45%">Owner</th>
        </tr>
      </thead>
      <tbody>
        ${RESPONSIBILITIES.map(r => `
        <tr>
          <td>${r.area}</td>
          <td style="color:var(--accent);font-weight:500">${r.owner}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>

  <!-- 7. IMPROVEMENTS -->
  <div class="card">
    <div class="section-num">Section 7</div>
    <div class="section-title">Planned improvements for next quarter</div>
    ${IMPROVEMENTS.map((imp, i) => `
    <div class="improvement-item">
      <div class="imp-num">${i + 1}</div>
      <div class="imp-text">${imp}</div>
    </div>`).join('')}
  </div>

  <div class="footer">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} &mdash; ${META.product} v${META.version}</div>

</div>
</body>
</html>`;

// ============================================================
//  WRITE FILE
// ============================================================

const outputFile = 'test-strategy-report.html';
fs.writeFileSync(outputFile, html, 'utf8');
console.log(`\n  Report generated: ${outputFile}\n`);
