# TripCentral

TripCentral is a full-stack travel management app built with Next.js, NextAuth, Prisma, PostgreSQL, Tailwind CSS, Leaflet, and Recharts.

## Features

- User auth (sign up, login, logout)
- Protected trip dashboard (user-specific data)
- Multi-trip CRUD
- Expense tracking with base-currency conversion
- Budget alerts and progress bar
- Weather integration
- Packing list with progress tracking
- Map markers with notes
- Trip info editor

## Tech Stack

- Next.js (App Router, TypeScript)
- NextAuth (Credentials)
- Prisma ORM
- PostgreSQL (Neon/Supabase recommended)
- Tailwind CSS

## Environment Variables

Create `.env.local`:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
NEXTAUTH_SECRET="your-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
OPENWEATHER_API_KEY=""
EXCHANGE_API_BASE="https://api.exchangerate.host"
```

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Generate Prisma client:

```bash
npm run prisma:generate
```

3. Push schema to DB:

```bash
npm run prisma:push
```

4. Start dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Free Deployment (Vercel + Neon)

1. Push repo to GitHub.
2. Create a free Neon Postgres project and copy the connection string.
3. In Vercel, import this repo.
4. Add environment variables in Vercel project settings:

- `DATABASE_URL` = Neon connection string
- `NEXTAUTH_SECRET` = long random string
- `NEXTAUTH_URL` = `https://<your-vercel-domain>`
- `OPENWEATHER_API_KEY` (optional but recommended)
- `EXCHANGE_API_BASE` = `https://api.exchangerate.host`

5. Deploy from Vercel.
6. After first deploy, run migrations once against production DB:

```bash
npm run prisma:deploy
```

(You can run this from local terminal with production `DATABASE_URL`, or in CI.)

## Database Models

- `User`
- `Trip`
- `Expense`
- `PackingItem`
- `MapLocation`

Relationships:

- One `User` -> many `Trip`
- One `Trip` -> many `Expense`
- One `Trip` -> many `PackingItem`
- One `Trip` -> many `MapLocation`