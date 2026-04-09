// Risk prioritization spreadsheet — fill this in for your product
const features = [
    {
        name: 'Credit card checkout',
        impact: 5,       // 1–5: generates direct revenue
        probability: 4,  // 1–5: complex area, history of bugs
        score: 20,       // impact × probability
        decision: 'CRITICAL — automate E2E + integration + production smoke tests',
    },
    {
        name: 'Login with email/password',
        impact: 5,
        probability: 2,  // stable, rarely breaks
        score: 10,
        decision: 'HIGH — automate main flow + security testing',
    },
    {
        name: 'Search filter by category',
        impact: 3,
        probability: 4,  // complex UI, changes frequently
        score: 12,
        decision: 'MEDIUM — manual testing per sprint, no automation',
    },
    {
        name: 'About Us page',
        impact: 1,
        probability: 1,
        score: 1,
        decision: 'LOW — semiannual visual check',
    },
];

// Sort by score to define automation priority
features.sort((a, b) => b.score - a.score);
features.forEach(f => console.log(`Score ${f.score}: ${f.name} — ${f.decision}`));

console.table(features);

// How to present the risk assessment to the team:
// "For this sprint, the HIGH-RISK features are X, Y, and Z — scores above 12.
// I will dedicate 70% of test coverage to them.
// Low-risk items will receive 30-minute exploratory testing each.
// Do you agree with this prioritization?"