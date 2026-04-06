# Requirements

## 🧰 Environment

Make sure you have the following installed:

* Node.js (>= 18 recommended)
* npm or yarn

## 📦 Dependencies

Core dependencies used in this project:

* jest
* supertest
* ts-jest
* typescript
* ts-node
* @types/jest
* @faker-js/faker
* jsonschema

Install all dependencies with:

```
npm install
```

---

## ⚙️ Configuration Requirements

### TypeScript (`tsconfig.json`)

* Must include:

```
{
  "compilerOptions": {
    "esModuleInterop": true,
    "types": ["node", "jest"]
  }
}
```

---

### Jest (`jest.config.ts`)

* Uses:

```
preset: 'ts-jest'
testEnvironment: 'node'
```

---

## ▶️ Running the Project

To execute tests:

```
npx jest --verbose
```

---

## 🌐 External Requirements

* Internet connection (for API requests)
* API endpoint available:
  https://jsonplaceholder.typicode.com