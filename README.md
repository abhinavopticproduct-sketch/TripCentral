# TripCentral

TripCentral is a full-stack travel management application built with Next.js, Prisma, NextAuth, SQLite, Tailwind CSS, Leaflet, and Recharts.

## Features

- User authentication (sign up/login/logout)
- Protected dashboard routes
- Multi-trip CRUD (create, view, edit, delete)
- Trip dashboard with overview cards and budget progress alerts
- Expense tracking with base-currency conversion
- Currency conversion tool with live rates
- Weather integration with current + 5-day forecast
- Packing list with progress tracking
- Interactive OpenStreetMap markers with notes
- Trip info management (dates, flight, hotel, notes)

## Tech Stack

- Next.js App Router + TypeScript
- NextAuth (Credentials provider)
- Prisma ORM + SQLite
- Tailwind CSS
- OpenWeather API
- ExchangeRate API (`https://api.exchangerate.host`)
- OpenStreetMap + Leaflet

## Environment Variables

Copy `.env.example` to `.env.local` and fill values:

```bash
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="change-me"
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

3. Run migrations:

```bash
npm run prisma:migrate -- --name init
```

4. Start dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

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