# Cold Mail House

Cold Mail House is a platform designed for scheduling and managing cold email campaigns. It allows you to create jobs, schedule them for future dates, and ensures they are sent out reliably without exceeding rate limits.

## Features

- **Google Authentication**: Sign in securely with your Google account.
- **Scheduling**: Set specific times for your emails to be sent automatically.
- **Queue Management**: Uses a robust queue system to handle background processing.
- **Rate Limiting**: Built-in protection to prevent spamming and maintain sender reputation.

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