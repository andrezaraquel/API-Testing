# API Testing with Jest, Supertest, Pact & k6

This project was created to practice API testing using **Jest**, **Supertest**, **Pact** and **k6** in a TypeScript environment, covering functional tests, contract tests and performance tests.

## 🚀 Purpose

The goal of this repository is to:

- Learn how to write automated API tests
- Practice HTTP request validation
- Understand test structure and best practices
- Work with real public APIs
- Apply contract testing with Pact to validate communication between consumer and provider
- Apply performance testing with k6 to validate API behavior under load
- Track quality metrics (DORA, Escape Rate, Defect Density) and visualise them through dashboards

## 🧪 Technologies

- TypeScript
- Jest
- Supertest
- ts-jest
- Pact (contract testing)
- k6 (performance testing)
- json-server (mock server for CI)

## 📁 Project Structure

```
.
├── tests/
│   ├── api/
│   │   └── *.test.ts                   → functional tests
│   ├── consumer/
│   │   └── *.consumer.test.ts          → pact consumer tests
│   ├── provider/
│   │   └── *.provider.test.ts          → pact provider tests
│   ├── k6/
│   │   ├── performance/
│   │   │   ├── smoke.test.ts           → smoke test (3 VUs, 1 min)
│   │   │   ├── load.test.ts            → load test (ramp-up to 100 VUs)
│   │   │   └── spike.test.ts           → spike test (sudden surge to 400 VUs)
│   │   └── data/
│   │       └── product.faker.ts        → shared test data for k6 scenarios
│   └── helpers/
│       └── request.ts                  → shared request helpers
├── metrics/
│   ├── dora-metrics.sh                 → DORA metrics extracted from Git history
│   ├── bug-metrics.ts                  → Escape Rate and Defect Density calculations
│   ├── metrics-dashboard.ts            → HTML quality dashboard generator
│   ├── example-metrics-dashboard.html  → Pre-generated example dashboard output
│   └── test-priority/
│       ├── generate-test-strategy.js   → Test Strategy report generator (configurable)
│       ├── risk-matrix.js              → Risk matrix calculator (impact × probability)
│       ├── test-pyramid.txt            → Current vs target pyramid reference
│       └── example-test-strategy-report.html → Pre-generated example report
├── pacts/                              → generated contract files
├── db.json                             → mock data for CI
├── jest.config.ts
├── tsconfig.json
├── package.json
```

## ⚙️ Installation

Clone the repository:
```bash
git clone https://github.com/andrezaraquel/API-Testing.git
cd API-Testing
```

Install dependencies:
```bash
npm install
```

### Installing k6

k6 is a separate binary and must be installed on your machine to run performance tests locally.

**Ubuntu / Debian:**
```bash
sudo gpg --no-default-keyring \
  --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
  --keyserver hkp://keyserver.ubuntu.com:80 \
  --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69

echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] \
  https://dl.k6.io/deb stable main" \
  | sudo tee /etc/apt/sources.list.d/k6.list

sudo apt-get update && sudo apt-get install -y k6
```

**macOS:**
```bash
brew install k6
```

**Windows:**
```bash
winget install k6
```

Verify the installation:
```bash
k6 version
```

## ▶️ Running Tests

Run all Jest tests:
```bash
npx jest --verbose
```

Run only functional tests:
```bash
npx jest tests/api --verbose
```

Run only contract tests:
```bash
npx jest tests/consumer tests/provider --verbose
```

### Running k6 performance tests

Run the smoke test (quick sanity check — 3 VUs for 1 minute):
```bash
npm run test:smoke
```

Run the load test (gradual ramp-up to 100 VUs — scheduled only):
```bash
npm run test:load
```

Run the spike test (sudden surge to 400 VUs):
```bash
npm run test:spike
```

Or run directly with a custom base URL:
```bash
BASE_URL=http://localhost:3000 k6 run tests/k6/performance/smoke.test.ts
```

## 📊 Performance Tests with k6

[k6](https://k6.io) is a developer-friendly performance testing tool that runs JavaScript/TypeScript scenarios simulating concurrent virtual users against an API.

### Test types

| Test | File | VUs | Duration | Purpose |
|---|---|---|---|---|
| Smoke | `smoke.test.ts` | 3 | 1 min | Sanity check — confirms the API responds correctly under minimal load |
| Load | `load.test.ts` | up to 100 | ~6 min | Validates API behavior under realistic sustained traffic |
| Spike | `spike.test.ts` | up to 400 | ~8 min | Validates API survival under a sudden and extreme traffic surge |

### Thresholds

Each test defines pass/fail thresholds. If any threshold fails, k6 exits with code 1 and the CI build breaks.

| Test | Threshold | Meaning |
|---|---|---|
| Smoke | `p(95) < 500ms` | 95% of requests must complete under 500ms |
| Smoke | `error rate < 1%` | Less than 1% of requests can fail |
| Load | `p(95) < 1000ms` | 95% of requests must complete under 1 second |
| Load | `p(99) < 2000ms` | 99% of requests must complete under 2 seconds |
| Spike | `p(99) < 5000ms` | 99% of requests must complete under 5 seconds |
| Spike | `error rate < 10%` | Up to 10% failure is acceptable under extreme load |

### Reading k6 output

A passing run looks like this:
```
✓ GET /posts: status is 200
✓ GET /posts: body is not empty
✓ GET /posts: response time under 500ms

checks.........................: 100.00%
http_req_duration..............: p(95)=120ms p(99)=200ms
http_req_failed................: 0.00%
```

A failing run exits with:
```
✗ http_req_duration: p(95)=620ms — FAILED (threshold: p(95)<500)
ERRO[0060] some thresholds have failed
```

## 🤝 Contract Testing with Pact

[Pact](https://docs.pact.io) is a contract testing tool that ensures two services can communicate correctly without needing to run both at the same time. The contract is a JSON file that describes exactly what the consumer expects from the provider.

The flow works in two steps:

### 1. Consumer test

Located in `tests/consumer/`, the consumer test defines the expectations — what requests will be made and what responses are expected. It runs against a **mock server** created by Pact locally, which simulates the provider. At the end of the run, Pact automatically generates a contract file in the `pacts/` folder.

For products, the consumer defines three interactions:

- `GET /products` — expects a list of products, each with `id`, `title`, `price`, `description`, `category`, `image` and `rating`
- `GET /products/1` — expects a single product with all the same fields
- `GET /products/999` — expects a `404` with body `{ erro: 'Produto não encontrado' }`

The matchers used (`like`, `eachLike`, `regex`) mean the contract validates the **shape and type** of the response, not the exact values — making it flexible and resilient to data changes.

### 2. Provider test

Located in `tests/provider/`, the provider test reads the contract file generated by the consumer and verifies that the real provider honours every interaction defined in it. It runs against a local Express server that proxies requests to `https://fakestoreapi.com`.

The `stateHandlers` define how to prepare the system for each scenario before the verification runs. Since the Fake Store API is a public read-only API, no data setup is needed — the handlers are intentionally empty.

### Contract flow summary

```
Consumer test runs
       ↓
Pact generates pacts/frontend-react-api-produtos.json
       ↓
Provider test reads the contract
       ↓
Verifier replays each interaction against the provider
       ↓
Test passes if all responses match the contract
```

## 📈 Quality Metrics

The `metrics/` folder contains scripts to measure and visualise quality across two dimensions: **delivery performance** (DORA) and **bug quality** (Escape Rate, Defect Density). Together they answer the question: *are we shipping fast and safely?*

### File overview

| File | What it does |
|---|---|
| `dora-metrics.sh` | Extracts DORA metrics from Git history via shell commands |
| `bug-metrics.ts` | Calculates Escape Rate, Defect Density and Critical Leakage from sprint data |
| `metrics-dashboard.ts` | Generates a visual HTML quality dashboard combining all metrics |
| `example-metrics-dashboard.html` | Pre-generated example of the dashboard output |
| `test-priority/generate-test-strategy.js` | Generates a full Test Strategy report as a standalone HTML file |
| `test-priority/risk-matrix.js` | Calculates test automation priority using impact × probability scoring |
| `test-priority/test-pyramid.txt` | Reference file with current vs target test pyramid distribution |
| `test-priority/example-test-strategy-report.html` | Pre-generated example of the strategy report output |

---

### DORA Metrics — `metrics/dora-metrics.sh`

[DORA](https://dora.dev) (DevOps Research and Assessment) defines four engineering metrics that measure delivery performance and operational stability. The shell script extracts them directly from the Git log — no external tools needed.

| Metric | What it measures | Elite benchmark | QA role |
|---|---|---|---|
| Deployment Frequency | How often the team deploys to production | Multiple times per day | Ensure the test suite is fast enough not to block the pipeline |
| Lead Time for Changes | Time from commit to production deploy | Less than 1 hour | Identify where tests add unnecessary latency |
| Change Failure Rate | % of deploys that cause a production incident | Less than 5% | Measure escape rate — bugs that passed QA and reached production |
| MTTR | Average time to recover from a failure | Less than 1 hour | Ensure smoke tests detect failures quickly after each deploy |

Run the script from the root of the repository:

```bash
bash metrics/dora-metrics.sh
```

The script outputs four blocks — one per metric. Deployment Frequency and Lead Time are extracted from Git history automatically. Change Failure Rate and MTTR require data from your incident tracker (Jira, Linear, PagerDuty) and are calculated using the formulas printed in the output.

---

### Bug Metrics — `metrics/bug-metrics.ts`

`bug-metrics.ts` calculates three sprint-level quality indicators from data you paste in from your issue tracker. All input values are defined at the top of the file as plain constants — update them at the start of each sprint report cycle.

**Escape Rate** measures the proportion of bugs that slipped past QA into production:

```
Escape Rate = bugs in production / (bugs found by QA + bugs in production) × 100
```

| Benchmark | Threshold |
|---|---|
| Good | Below 10% |
| Excellent | Below 5% |
| Alert | Above 20% — coverage has serious gaps; review what is not being tested |

**Defect Density** measures bug concentration relative to work delivered:

```
Defect Density = bugs found / story points delivered (or lines of code)
```

There is no universal benchmark for Defect Density — the value varies by domain and team. The meaningful signal is the trend: compare modules internally sprint over sprint. A module with density 3× above the team average deserves targeted attention in the next sprint.

**Bug Leakage by Severity** isolates critical bugs specifically:

```
Critical Leakage = (critical bugs in production / total critical bugs) × 100
```

The target is 0%. Any critical bug reaching production should trigger an immediate team conversation about test coverage gaps.

---

### Quality Dashboard — `metrics/metrics-dashboard.ts`

`metrics-dashboard.ts` generates a self-contained HTML file combining all metrics into a visual sprint report. The output includes metric cards, a sprint comparison table, a bug trend chart, a risk list and a prioritised action board for the next sprint. A pre-generated example is available at `metrics/example-metrics-dashboard.html`.

Run it with:

```bash
npx ts-node metrics/metrics-dashboard.ts
```

All sprint data (bug counts, DORA values, risks, actions) is defined in a single `CONFIG` object at the top of the file. Update those values each sprint and re-run to regenerate the report.

---

### Test Strategy & Prioritisation — `metrics/test-priority/`

This subfolder contains tools to define *what* to test and *why*, before a sprint begins.

**`generate-test-strategy.js`** generates a full Test Strategy document as a styled HTML file. It covers test pyramid distribution, automation criteria, environment coverage, release quality gates, team responsibilities and planned improvements. All content is driven by a `CONFIG` block at the top of the script — edit it once per product or release cycle:

```bash
node metrics/test-priority/generate-test-strategy.js
# → outputs test-strategy-report.html
```

**`risk-matrix.js`** scores each feature or module by multiplying **impact** (how bad a failure would be) by **probability** (how likely the failure is). The score drives the automation decision:

| Score | Recommendation |
|---|---|
| Above 10 | Automate — high risk, recurring execution |
| 5–10 | Evaluate — consider frequency and maintenance cost |
| Below 5 | Skip automation — low ROI |

**`test-pyramid.txt`** is a plain-text reference file with the current vs target distribution across unit, integration/API and E2E layers. It is intentionally kept as a `.txt` so it can be read quickly without running any script — useful as a checklist during sprint planning or test reviews.

**`example-test-strategy-report.html`** is a pre-generated example of the full strategy report, committed to the repository so reviewers can inspect the output without running the generator.

---

## 🔧 CI with GitHub Actions

The project has two CI workflows:

### Jest + Pact (runs on every push)

Functional and contract tests run against a local mock server powered by `json-server`. The `BASE_URL` environment variable controls which server is used — locally it defaults to `https://fakestoreapi.com`, in CI it points to `http://localhost:3000`.

### k6 Performance Tests (runs on push to main/develop + schedule)

| Job | Trigger | Description |
|---|---|---|
| Smoke | Every push to `main` or `develop` | Quick sanity check on every deploy |
| Load | Weekdays at 6pm BRT (cron) | Full load test runs daily after business hours |

The load test only runs on schedule to avoid slowing down the regular CI pipeline on every push.

## 🌐 API Used

- https://fakestoreapi.com

## ✅ Example Test Cases

- Get all products → expects 200 with a list of products
- Get product by ID → expects 200 with matching fields
- Get non-existent product → expects 404
- Contract: consumer expectations are defined and verified against the provider
- Smoke: API responds correctly under minimal load with p(95) under 500ms
- Load: API sustains 100 concurrent users with p(95) under 1 second
- Spike: API survives a sudden surge to 400 users without returning 5xx errors

## 📄 License

This project is open-source and available under the MIT License.