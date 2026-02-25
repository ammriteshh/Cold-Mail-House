# Cold Mail House

A robust, distributed cold email automation platform built for reliable and scalable outreach.

## 🚀 Overview
*   **Built a personalized full-stack cold email automation platform** designed for individual management of targeted outreach and marketing campaigns.
*   **Structured a resilient background job processing system** using Node.js, BullMQ, and Redis to handle high-throughput queues, ensuring reliable delivery for personal mailing lists.
*   **Optimized database performance** by modeling specialized relationships for campaigns, scheduling, and delivery audit logs using Prisma ORM.

## Features
- **Precise Scheduling**: Uses BullMQ delayed jobs for exact delivery timing.
- **Reliable Background Processing**: Decoupled architecture to handle high volumes without performance degradation.
- **Rate Limit Compliance**: Intelligent protection to maintain sender reputation.
- **Modern Tech Stack**: Built with TypeScript, React, and PostgreSQL.

## Tech Stack

The project is built using:
- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL, Redis

## How to Run

### Prerequisites
Make sure you have the following installed:
- Node.js
- PostgreSQL
- Redis

### Installation
Clone the repository and install all dependencies:

```bash
npm run install:all
```

### Configuration
You need to set up environment variables in both the `backend` and `frontend` directories.

**Backend (.env)**
Create a `.env` file in the `backend` folder with these variables:
- `PORT` (default: 3000)
- `DATABASE_URL` (PostgreSQL connection string)
- `REDIS_HOST` & `REDIS_PORT` (optional, for queue management)
- `GOOGLE_CLIENT_ID` (from Google Cloud Console)
- `GOOGLE_CLIENT_SECRET` (from Google Cloud Console)
- `GOOGLE_CALLBACK_URL` (e.g., `http://localhost:3000/auth/google/callback` for dev, or your production URL)
- `SESSION_SECRET` (random secret string for session encryption)
- `FRONTEND_URL` (e.g., `http://localhost:5173` for dev, or your production frontend URL)

**Frontend (.env)**
Create a `.env` file in the `frontend` folder:
- `VITE_API_URL` (optional, defaults to `http://localhost:3000` in dev or `https://cold-mail-house.onrender.com` in production)

### Start the Application
Run both the frontend and backend servers with a single command:

```bash
npm run dev
```