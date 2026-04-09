// Paste your data from Jira / Linear / GitHub Issues
const sprintData = {
  sprint: 'Sprint 42',
  period: '2024-01-15 to 2024-01-29',

  // Bugs caught by QA before reaching production, grouped by severity
  bugsQA: { critical: 2, high: 8, medium: 15, low: 12, total: 37 },

  // Bugs reported by users or monitoring after deploy
  bugsProduction: { critical: 0, high: 2, medium: 3, total: 5 },

  // Story points delivered in the sprint (used for Defect Density)
  storyPoints: 42,
};

// ─────────────────────────────────────────────────────────────────
// METRIC:    Escape Rate
// MEASURES:  Proportion of bugs that slipped past QA into production
// FORMULA:   bugsProduction / (bugsQA + bugsProduction) * 100
// BENCHMARK: below 10% is good — below 5% is excellent
// ALERT:     above 20% → your coverage has serious gaps;
//            review what is not being tested
// ─────────────────────────────────────────────────────────────────
const escapeRate = (
  sprintData.bugsProduction.total /
  (sprintData.bugsQA.total + sprintData.bugsProduction.total) * 100
).toFixed(1);

// ─────────────────────────────────────────────────────────────────
// METRIC:    Defect Density
// MEASURES:  Bug concentration relative to work delivered
// FORMULA:   bugsFound / storyPoints (or lines of code)
// BENCHMARK: varies by domain — compare modules internally,
//            not against external benchmarks
// ALERT:     a module with density 3x above average deserves
//            special attention in the next sprint
// ─────────────────────────────────────────────────────────────────
const defectDensity = (
  sprintData.bugsQA.total / sprintData.storyPoints
).toFixed(2);

// ─────────────────────────────────────────────────────────────────
// METRIC:    Bug Leakage by Severity
// MEASURES:  % of critical bugs that escaped into production
// FORMULA:   (critical bugs in production / total critical bugs) * 100
// BENCHMARK: target is 0% — no critical bug should reach production
// ALERT:     any critical bug in production requires an immediate
//            team conversation about test coverage
// ─────────────────────────────────────────────────────────────────
const criticalLeakage = sprintData.bugsProduction.critical === 0
  ? '0%'
  : ((sprintData.bugsProduction.critical /
    (sprintData.bugsQA.critical + sprintData.bugsProduction.critical)) * 100
  ).toFixed(1) + '%';

console.log(`Escape Rate:       ${escapeRate}%`);      // 11.9% — above ideal, review coverage
console.log(`Defect Density:    ${defectDensity}`);    // 0.88 bugs/SP
console.log(`Critical Leakage:  ${criticalLeakage}`);  // 0%   — excellent

