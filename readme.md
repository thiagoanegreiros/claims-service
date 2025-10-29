# ⚙️ Claims Service

![Node.js](https://img.shields.io/badge/node-%3E=20.x-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)
![Middy](https://img.shields.io/badge/middy-6.x-orange.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.x-3178C6?logo=typescript&logoColor=white)
![ESLint](https://img.shields.io/badge/lint-eslint-4B32C3?logo=eslint&logoColor=white)
![Husky](https://img.shields.io/badge/precommit-husky-000000?logo=git&logoColor=white)

The **Claims Service** is a backend API built with **Node.js** and **TypeScript**, designed for ingesting and querying **healthcare claims CSV files**.  
It follows the principles of **Hexagonal Architecture (Ports & Adapters)**, focusing on **clarity, testability, extensibility, and simplicity**.

This project simulates a real-world internal service used by customer support agents to:

- Upload daily claim exports from a legacy system  
- Validate and normalize incoming data  
- Store them temporarily in memory  
- Allow filtering and querying for specific claims  

---

## 🚀 Features

- ✅ **Hexagonal Architecture** (Domain → Application → Adapters)
- ✅ **Node.js + TypeScript** with strict type checking
- ✅ **Middy** middleware framework (AWS Lambda simulation)
- ✅ **Express.js** for local development and debugging
- ✅ CSV ingestion with field validation and error reporting
- ✅ Filtering by `memberId`, `startDate`, and `endDate`
- ✅ Automatic sorting by `serviceDate` (descending)
- ✅ In-memory storage (mock repository)
- ✅ Ready for unit and integration testing using **Jest**
- ✅ Local execution via **VSCode Debug** or `npm run dev`
- ✅ Jest Parcial unit test coverage
- ✅ Integration tests for all endpoints  
- ✅ Husky and Linting

---

## 🧱 Project Structure

### Development Mode

```bash
npm run dev
```

The local Express server runs on:

```
http://localhost:3000
```

---

## 🔌 API Endpoints

| Method | Endpoint           | Description                          |
|--------|--------------------|--------------------------------------|
| **POST** | `/claims`           | Upload and ingest a CSV file         |
| **GET**  | `/claims`           | List all claims (with optional filters) |
| **GET**  | `/claims/:id`       | Retrieve a single claim by ID        |

---

## 📄 Example Requests

### ➕ Upload CSV (POST /claims)

```bash
curl -X POST   -H "Content-Type: text/plain"   --data-binary @sample.csv   http://localhost:3000/claims
```

**Example Response**

```json
{
  "successCount": 4,
  "errorCount": 3,
  "errors": [
    { "row": 4, "message": "serviceDate cannot be in the future" },
    { "row": 5, "message": "Missing memberId" },
    { "row": 6, "message": "Invalid totalAmount (not a positive integer)" }
  ]
}
```

---

### 🔍 Query Claims (GET /claims)

```bash
curl "http://localhost:3000/claims?memberId=MBR001&startDate=2025-05-01&endDate=2025-05-31"
```

**Example Response**

```json
{
  "claims": [
    {
      "claimId": "CLM001",
      "memberId": "MBR001",
      "provider": "HealthCare Inc",
      "serviceDate": "2025-05-14",
      "totalAmount": 12500,
      "diagnosisCodes": ["R51", "K21.9"]
    }
  ],
  "totalAmountSum": 12500
}
```

---

## 🧠 Architecture Overview

This project follows the **Hexagonal Architecture (Ports & Adapters)** pattern:

```
            +----------------------------+
            |        Presentation        |
            |  (Express / Middy Handlers) |
            +-------------+--------------+
                          |
                          ▼
            +----------------------------+
            |        Application         |
            |  (Use Cases / Services)    |
            +-------------+--------------+
                          |
                          ▼
            +----------------------------+
            |           Domain           |
            | (Entities & Interfaces)    |
            +-------------+--------------+
                          |
                          ▼
            +----------------------------+
            |        Infrastructure      |
            | (Repository / Clock / IO)  |
            +----------------------------+
```

This separation ensures:
- Independence from frameworks  
- Easy unit testing of business logic  
- Clean dependency inversion  

---

## 🧪 Testing

Tests implemented using **Jest** and structured per layer:

```bash
npm run test
```

Structure:

```
tests/
├── application/
│   └── ingest_claims_service.spec.ts
├── adapters/
│   ├── inbound/
│   └── out/
└── domain/
```

---

## 🧰 Development Tools

| Tool | Purpose |
|------|----------|
| **TypeScript** | Strong typing and code reliability |
| **Middy** | Middleware engine (AWS Lambda-style) |
| **Express** | Local API server and debugging |
| **Jest** | Unit & integration testing |
| **ESLint + Prettier** | Linting and code formatting |
| **VSCode Launch Config** | Built-in debugging setup |

---

## 🧩 Example Debugging (VSCode)

To debug locally in VSCode:

1. Open the **Run and Debug** tab  
2. Select the configuration `Debug Claims Service`  
3. Press **F5**

Breakpoints can be set anywhere in `src/**/*.ts`.

---

## 🤝 Contributing

This is a personal project built for demonstration and technical assessment purposes.  
However, contributions and suggestions are always welcome!

Feel free to:
- Submit pull requests  
- Suggest improvements  
- Report issues or open discussions  

---

## 🧑‍💻 Author

**Thiago Ananias**  
Cloud Architect & Software Engineer  
[GitHub](https://github.com/thiagoanegreiros) • [LinkedIn](https://linkedin.com/in/thiagoanegreiros)

---

## 🪪 License

This project is licensed under the **MIT License**.  
See [LICENSE](./LICENSE) for details.
