# Global-Fi Ultra — Backend

Node.js + Express backend for the Global-Fi Ultra financial data platform.

## Stack

- **Runtime**: Node.js 20+ (ESM)
- **Framework**: Express 4
- **Database**: MongoDB 7 (Mongoose)
- **Cache**: Redis 7 (ioredis)
- **Queue**: RabbitMQ 3 (amqplib)
- **AI**: Groq SDK (Llama 3.3 70B / 3.1 8B)
- **WebSocket**: Socket.io 4
- **Logging**: Winston

## Setup

```bash
# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your API keys

# Start development server (with auto-reload)
npm run dev

# Start production server
npm start
```

## Environment Variables

See `.env.example` for all available configuration options.

Required for full functionality:
- `MONGODB_URI` — MongoDB connection string
- `GROQ_API_KEY` — Groq AI API key (optional, disables AI features if missing)
- `ALPHA_VANTAGE_API_KEY` — Stock data
- `NEWS_API_KEY` — Financial news
- `FRED_API_KEY` — Economic indicators
- `FINNHUB_API_KEY` — Market news
- `JWT_SECRET` — Secret key for JWT token signing (has a dev default, **change in production**)
- `JWT_EXPIRES_IN` — Token expiry duration (default: `7d`)

## API Endpoints

All routes are prefixed with `/api/v1`:

| Route | Description |
|---|---|
| `GET /health/health` | Health check |
| `GET /health/readiness` | Readiness probe |
| `GET /financial/live` | Live market data |
| `GET /financial/cached` | Cached market data |
| `POST /users/login` | Login — returns `{ token, user }` |
| `POST /users` | Register new user |
| `GET/PUT/DELETE /users/:id` | User management |
| `GET/POST /watchlists` | Watchlist CRUD |
| `GET/POST /alerts` | Price alert CRUD |
| `PATCH /alerts/:id/activate` | Activate alert |
| `PATCH /alerts/:id/deactivate` | Deactivate alert |
| `GET/POST /assets` | Asset management |
| `GET /assets/:symbol/live` | Live price for asset |
| `POST /ai/sentiment` | Sentiment analysis |
| `POST /ai/analyze` | Asset analysis |
| `POST /ai/recommend` | Investment recommendations |
| `POST /ai/portfolio` | Portfolio analysis |
| `POST /ai/predict` | Price prediction |
| `GET /status/circuit-breakers` | Circuit breaker status |
| `POST /admin/cache/clear` | Clear Redis cache |

## Authentication

Login via `POST /api/v1/users/login` with `{ email, password }`.
The response includes a signed JWT token. Pass it as a `Bearer` token on subsequent requests:

```
Authorization: Bearer <token>
```

Protected routes use the `requireAuth` middleware from `src/middleware/authMiddleware.js`.
Currently all resource routes allow unauthenticated access for development convenience — add `requireAuth` to any route to lock it down.
| `POST /ai/recommend` | Investment recommendations |
| `POST /ai/portfolio` | Portfolio analysis |
| `GET /admin/metrics` | System metrics |
| `GET /status/circuit-breakers` | API health status |

## Project Structure

```
backend/
├── server.js              # Entry point — HTTP + Socket.io bootstrap
├── src/
│   ├── app.js             # Express app factory + route mounting
│   ├── config/            # DB, Redis, RabbitMQ, logger, env config
│   ├── controllers/       # Request handlers (thin layer)
│   ├── di/                # Dependency injection container
│   ├── infrastructure/
│   │   ├── ai/            # Groq client + AI config
│   │   ├── cache/         # Redis cache wrapper
│   │   ├── http/          # External API clients (6 sources)
│   │   ├── messaging/     # RabbitMQ job queue
│   │   ├── repositories/  # Data access layer (Mongoose)
│   │   ├── resilience/    # Circuit breaker + retry strategy
│   │   └── websocket/     # Socket.io manager + AI streaming
│   ├── middleware/        # Auth, rate limiting, CORS, error handling
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Express route definitions
│   ├── services/          # Business logic layer
│   ├── tools/             # CLI utilities (Redis monitor)
│   ├── utils/             # Shared helpers
│   └── validators/        # Zod input validation schemas
└── __tests__/             # Jest test suite
```

## Running with Docker

From the project root:

```bash
docker-compose up
```

This starts the app, MongoDB, Redis, and RabbitMQ together.
