import * as fs from "fs";

const data = {
    sprint: 42,
    date: "Abril 2026",
    status: "🟡 Atenção",
    summary: [
        "Escape rate acima da meta.",
        "Módulo de pagamento com density elevada.",
        "Ação prioritária: adicionar testes de integração no checkout."
    ],
    dora: [
        { name: "Deployment Frequency", value: "3x/semana", goal: "5x/semana", trend: "📈 melhora" },
        { name: "Lead Time", value: "4h", goal: "< 1h", trend: "➖ estável" },
        { name: "Change Failure Rate", value: "8%", goal: "< 5%", trend: "📉 piora" },
        { name: "MTTR", value: "45min", goal: "< 1h", trend: "✅ ok" }
    ],
    qa: [
        { name: "Bugs encontrados QA", current: 37, previous: 29, delta: "+28%" },
        { name: "Bugs em produção", current: 5, previous: 3, delta: "+67%" },
        { name: "Escape Rate", current: "11.9%", previous: "9.4%", delta: "📉 piora" },
        { name: "Defect Density", current: "0.88/SP", previous: "0.71/SP", delta: "📉 piora" },
        { name: "Critical Leakage", current: "0%", previous: "0%", delta: "✅ ok" }
    ],
    risks: [
        "Módulo de Pagamento — 40% dos bugs. Cobertura E2E: 35%",
        "Integração com gateway externo — sem testes de contrato",
        "Fluxo de cancelamento — não testado desde dez/23"
    ],
    actions: [
        "[ ] Adicionar 10 testes de integração no módulo de pagamento (@joao)",
        "[ ] Criar contrato Pact para gateway (@maria)",
        "[ ] Revisar testes do fluxo de cancelamento (@carlos)"
    ]
};

const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Dashboard de Qualidade</title>
<style>
  body {
    font-family: Arial, sans-serif;
    background: #0f172a;
    color: #e2e8f0;
    padding: 20px;
  }
  h1, h2 {
    color: #38bdf8;
  }
  .card {
    background: #1e293b;
    padding: 16px;
    border-radius: 10px;
    margin-bottom: 20px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td {
    padding: 10px;
    border-bottom: 1px solid #334155;
    text-align: left;
  }
  th {
    color: #94a3b8;
  }
  .status {
    font-size: 20px;
    margin-bottom: 10px;
  }
  .ok { color: #22c55e; }
  .warn { color: #facc15; }
  .bad { color: #ef4444; }
</style>
</head>

<body>

<h1>📊 Dashboard de Qualidade — Sprint ${data.sprint}</h1>
<p>${data.date}</p>

<div class="card">
  <div class="status">${data.status}</div>
  ${data.summary.map(s => `<p>• ${s}</p>`).join("")}
</div>

<div class="card">
  <h2>DORA Metrics (últimos 30 dias)</h2>
  <table>
    <tr>
      <th>Métrica</th>
      <th>Valor</th>
      <th>Meta</th>
      <th>Tendência</th>
    </tr>
    ${data.dora.map(d => `
      <tr>
        <td>${d.name}</td>
        <td>${d.value}</td>
        <td>${d.goal}</td>
        <td>${d.trend}</td>
      </tr>
    `).join("")}
  </table>
</div>

<div class="card">
  <h2>Métricas de QA</h2>
  <table>
    <tr>
      <th>Métrica</th>
      <th>Sprint Atual</th>
      <th>Sprint Anterior</th>
      <th>Delta</th>
    </tr>
    ${data.qa.map(q => `
      <tr>
        <td>${q.name}</td>
        <td>${q.current}</td>
        <td>${q.previous}</td>
        <td>${q.delta}</td>
      </tr>
    `).join("")}
  </table>
</div>

<div class="card">
  <h2>⚠️ Top 3 Riscos</h2>
  <ul>
    ${data.risks.map(r => `<li>${r}</li>`).join("")}
  </ul>
</div>

<div class="card">
  <h2>✅ Ações — Próxima Sprint</h2>
  <ul>
    ${data.actions.map(a => `<li>${a}</li>`).join("")}
  </ul>
</div>

</body>
</html>
`;

fs.writeFileSync("dashboard.html", html);

console.log("✅ Dashboard gerado: dashboard.html");