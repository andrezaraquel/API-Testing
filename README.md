# API Testing with Jest & Supertest

This project was created to practice API testing using **Jest** and **Supertest** in a TypeScript environment.

## 🚀 Purpose

The goal of this repository is to:

* Learn how to write automated API tests
* Practice HTTP request validation
* Understand test structure and best practices
* Work with real public APIs

## 🧪 Technologies

* TypeScript
* Jest
* Supertest
* ts-jest

## 📁 Project Structure

```
.
├── tests/
│   └── api/
│       └── *.test.ts
├── jest.config.ts
├── tsconfig.json
├── package.json
```

## ⚙️ Installation

Clone the repository:

```
git clone https://github.com/andrezaraquel/API-Testing.git
cd API-Testing
```

Install dependencies:

```
npm install
```

## ▶️ Running Tests

```
npx jest --verbose
```

## ✅ Example Test Cases

* Get all posts → expects 200
* Get post by ID → expects 200
* Get non-existent post → expects 404

## 🌐 API Used

* https://fakestoreapi.com

## 📚 Learning Goals

* Understand REST API testing
* Validate response structure and status codes
* Improve confidence with automated testing tools


## 📄 License

This project is open-source and available under the MIT License.
