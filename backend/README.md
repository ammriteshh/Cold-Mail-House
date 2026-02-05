# Cold Mail House - Email Scheduler Backend

A robust, distributed email scheduling system built with TypeScript, Express, BullMQ, and Redis. Designed for high availability, fault tolerance, and strict rate limiting.

## 🏗 Architecture

The system decouples **ingestion** (API) from **execution** (Worker) to handle spikes in traffic without degrading performance.

`[Client] -> [Express API] -> [PostgreSQL (Job Persistence)] -> [BullMQ (Redis)] -> [Worker Pool] -> [SMTP]`

### Core Components
- **API**: Accepts scheduling requests, persists initial state to DB, and offloads delivery to the queue.
- **Queue (BullMQ)**: Manages job lifecycle, retries, and delayed scheduling.
- **Worker**: Stateless consumers that process email jobs. Supports horizontal scaling.
- **Redis**: Acts as the broker for BullMQ and the atomic counter store for rate limiting.
- **PostgreSQL**: Source of truth for job history and status (Audit Log).

## 🚀 Key Features

### 1. Reliable Scheduling & Persistence
- **No Cron Jobs**: Instead of polling the DB every minute (which limits scale and precision), we use **BullMQ Delayed Jobs**. This allows precise scheduling (e.g., "send in 43 minutes") and reduces database load.
- **Crash Recovery**: Jobs are persisted in Postgres (`PENDING` state) and Redis. If the worker process dies, the unacknowledged job stays in Redis and is picked up by another worker or retry mechanism.

### 2. Idempotency & Deduplication
- **Unique Constraints**: The system accepts an optional `idempotencyKey`. If provided, it maps to a unique constraint in the database, preventing duplicate schedule requests at the API level.
- **Atomic State Checks**: Before sending, the worker checks the Database status. If a job is already marked `COMPLETED` (e.g., due to a race condition or previous partial failure), it is skipped.

### 3. Rate Limiting (Redis-Backed)
- **Hourly Limits**: Enforces a strict limit (e.g., 100 emails/sender/hour).
- **Distributed Counting**: Uses atomic Redis `INCR` operations. This is safe across multiple concurrent worker nodes; memory counters would fail in a clustered environment.
- **Rescheduling Strategy**: If a sender exceeds their limit, the job is **not dropped**. It is caught, logged, and rescheduled to the delayed queue to retry at the top of the next hour.

### 4. Concurrency
- **Worker Concurrency**: Configured to process `N` jobs in parallel per instance.
- **Global Rate Limiting**: An optional second layer of protection using BullMQ's `limiter` to control the total throughput of the queue (e.g., max 10 jobs/sec globally).

## 🛠 Setup & Verification

### Prerequisites
- Node.js v16+
- PostgreSQL
- Redis

### Environment Variables
Copy `.env.example` to `.env`:
```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"
REDIS_HOST="localhost"
REDIS_PORT=6379
EMAIL_USER="ethereal_user"
EMAIL_PASS="ethereal_pass"
```

### Installation
```bash
npm install
npx prisma migrate dev --name init
```

### Running the System
```bash
# Starts Express API and Background Worker
npm run dev
```

## 📡 API Reference

### Schedule Email
**POST** `/schedule-email`

```json
{
  "recipient": "user@example.com",
  "subject": "Welcome!",
  "body": "<h1>Hello</h1>",
  "senderId": "sender_123",
  "scheduledAt": "2023-10-27T10:00:00Z" // Optional. Defaults to now.
}
```

**Response**:
```json
{
  "message": "Email scheduled",
  "jobId": 1
}
```

## ⚖️ Trade-offs

- **BullMQ vs Custom Polling**: BullMQ adds Redis complexity but solves distributed locking, retries, and backoff out of the box. Custom polling is simpler for <100 jobs but fails at scale.
- **Prisma**: Adds a slight runtime overhead compared to raw SQL but ensures type safety and prevents SQL injection, vital for long-term maintainability.
