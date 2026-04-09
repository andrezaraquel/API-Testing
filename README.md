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
│   │   │   ├── smoke.test.ts           → smoke test (1 VU, 1 min)
│   │   │   ├── load.test.ts            → load test (ramp-up to 100 VUs)
│   │   │   └── spike.test.ts           → spike test (sudden surge to 400 VUs)
│   │   └── data/
│   │       └── product.faker.ts        → shared test data for k6 scenarios
│   └── helpers/
│       └── request.ts                  → shared request helpers
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