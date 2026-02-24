# Teacher Insights Dashboard

A production-oriented **Teacher Insights Dashboard** built with **Next.js App Router**, **TypeScript**, **Prisma**, **PostgreSQL (Neon-compatible)**, **Tailwind CSS**, **Recharts**, and **Zod**.

Principals can view high-level teacher activity and drill into per-teacher insights (weekly trends, class-wise breakdown, and recent activity).

---

## Architecture Overview

- **Framework**: Next.js 16 (App Router, `src/app`)
- **Language**: TypeScript, strict mode
- **Styling**: Tailwind CSS (v4) with a minimal, responsive admin layout
- **Database**: PostgreSQL (local or Neon)
- **ORM**: Prisma 7 using the `@prisma/adapter-pg` adapter and `pg` Pool
- **Validation**: Zod schemas for request and query validation
- **Charts**: Recharts for weekly trends and class breakdown

### Folder Structure (high level)

- `src/app`
  - `layout.tsx` – global layout, fonts, global styles
  - `page.tsx` – redirects `/` → `/dashboard`
  - `dashboard/`
    - `layout.tsx` – dashboard layout using sidebar
    - `page.tsx` – main admin dashboard (overview + per-teacher)
    - `loading.tsx` – skeleton loading UI
    - `error.tsx` – error boundary for dashboard failures
  - `api/`
    - `dashboard/overview/route.ts` – overview metrics endpoint
    - `dashboard/weekly/route.ts` – weekly aggregated activity
    - `teacher/[id]/insights/route.ts` – per-teacher insights
    - `teachers/route.ts` – list of teachers for dropdowns
    - `activity/route.ts` – activity upsert endpoint (handles duplicates)
- `src/components`
  - `layout/Sidebar.tsx` – sidebar + shell layout
  - `dashboard/OverviewCards.tsx` – top KPI cards
  - `dashboard/WeeklyActivityChart.tsx` – weekly trend line chart (Recharts)
  - `dashboard/ClassBreakdownChart.tsx` – class-wise bar chart (Recharts)
  - `dashboard/RecentActivityTable.tsx` – paginated activity table
  - `dashboard/TeacherInsightsPanel.tsx` – teacher selector + insights view
- `src/lib`
  - `prisma.ts` – Prisma client, pg adapter, connection pooling
  - `validation.ts` – Zod schemas and DTO types
  - `services/dashboardService.ts` – overview and weekly aggregation queries
  - `services/teacherService.ts` – per-teacher aggregation, upsert, insights
- `prisma/`
  - `schema.prisma` – DB schema and indexes
  - `prisma.config.ts` – Prisma 7 datasource config

The app follows **SOLID** and separation of concerns:

- **Routes (`app/api/...`)** are thin – they only:
  - validate input with Zod,
  - call the corresponding service,
  - shape HTTP responses.
- **Service layer (`src/lib/services/...`)** encapsulates all Prisma logic.
- **Components** are small, reusable, and typed. Chart components are client-only and receive typed, pre-aggregated data.

---

## Database Schema

Prisma schema (`prisma/schema.prisma`):

- **Teacher**
  - `id` – `String @id @db.VarChar(64)` (teacher identifier)
  - `name` – `String`
  - `createdAt` – `DateTime @default(now())`
  - relation: `activities Activity[]`
  - index: `@@index([name])`

- **Activity**
  - `id` – `String @id @default(uuid())`
  - `teacherId` – FK → `Teacher.id`
  - `teacher` – relation with `onDelete: Cascade`
  - `activityType` – enum `ActivityType`
    - `LESSON`
    - `QUIZ`
    - `ASSESSMENT`
  - `createdAt` – `DateTime`
  - `subject` – `String`
  - `class` – `String`
  - unique constraint: `@@unique([teacherId, activityType, createdAt])`
  - indexes:
    - `@@index([activityType, createdAt])`
    - `@@index([teacherId, createdAt])`

### Indexing Strategy

- **`@@unique([teacherId, activityType, createdAt])`**
  - Enforces duplicate protection for the same teacher, type, and timestamp.
  - Supports `upsert` queries that deduplicate activity creation.
- **`@@index([teacherId, createdAt])`**
  - Speeds up per-teacher queries:
    - Weekly trends
    - Recent activity (ordered by `createdAt`)
    - Class-level breakdown (filtering by teacher)
- **`@@index([activityType, createdAt])`**
  - Speeds up global aggregations for dashboard overview/weekly stats.
- **`@@index([name])` on `Teacher`**
  - Enables efficient ordering and search by teacher name.

---

## API Design

All responses are fully typed in TypeScript, and payloads are validated with **Zod** in `src/lib/validation.ts`.

### 1. `GET /api/dashboard/overview`

**Response:**

```json
{
  "totalTeachers": 12,
  "totalLessons": 134,
  "totalQuizzes": 58,
  "totalAssessments": 27
}
```

Implementation: `getOverviewStats()` in `dashboardService.ts` uses **database-level aggregation** via Prisma `count()` queries.

### 2. `GET /api/dashboard/weekly`

**Query params (optional):**

- `from` – ISO datetime string
- `to` – ISO datetime string

Validated via `dateRangeSchema`.

**Response (array):**

```json
[
  {
    "weekStart": "2026-02-16T00:00:00.000Z",
    "lessons": 12,
    "quizzes": 5,
    "assessments": 3
  }
]
```

Implementation:

- `getWeeklyActivityTrend()` in `dashboardService.ts`
- Uses `DATE_TRUNC('week', "createdAt")` and `SUM(CASE WHEN ...)` with `prisma.$queryRawUnsafe`.
- All heavy aggregation happens **inside PostgreSQL**, not in the frontend.

### 3. `GET /api/teacher/:id/insights`

**Path params:**

- `id` – teacher id (validated by `teacherIdSchema`)

**Query params:**

- `page` – page number (1+), default `1`
- `pageSize` – page size (1–100), default `10`
- `from`, `to` – optional ISO datetimes for weekly trend range

Validated using:

- `paginationSchema`
- `dateRangeSchema`

**Response:**

```json
{
  "teacherId": "t1",
  "teacherName": "Alice Johnson",
  "totals": {
    "lessons": 30,
    "quizzes": 14,
    "assessments": 6
  },
  "weeklyTrend": [
    {
      "weekStart": "2026-02-16T00:00:00.000Z",
      "lessons": 3,
      "quizzes": 1,
      "assessments": 0
    }
  ],
  "classBreakdown": [
    {
      "class": "Grade 5A",
      "lessons": 10,
      "quizzes": 4,
      "assessments": 2
    }
  ],
  "recentActivities": {
    "items": [
      {
        "id": "act_123",
        "activityType": "LESSON",
        "subject": "Math - Fractions",
        "class": "Grade 5A",
        "createdAt": "2026-02-20T09:15:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 10
  },
  "summaryInsight": "quiz creation increased by 30% compared to last week."
}
```

Implementation: `getTeacherInsights()` in `teacherService.ts` orchestrates:

- `getTeacherTotals()` – per-type counts using Prisma `count()`.
- `getTeacherWeeklyTrend()` – `DATE_TRUNC('week', createdAt)` aggregation.
- `getTeacherClassBreakdown()` – `GROUP BY class` with per-type `SUM(CASE WHEN ...)`.
- `getRecentActivities()` – **paginated** `findMany` query ordered by `createdAt DESC`.
- `generateSummaryFromWeeklyTrend()` – computes a human-like change summary:
  - Compares last week vs previous week.
  - Calculates percentage increase/decrease for each activity type.
  - Returns a sentence such as:
    - `"quiz creation increased by 30% compared to last week."`

All aggregations and pagination are implemented at the **database level** to avoid large result sets and expensive client-side computation.

### 4. `POST /api/activity`

Used to insert or update activity records and handle duplicates gracefully.

**Request body (validated by `createActivitySchema`):**

```json
{
  "teacherId": "t1",
  "teacherName": "Alice Johnson",
  "activityType": "QUIZ",
  "createdAt": "2026-02-21T10:00:00.000Z",
  "subject": "Science - Plants",
  "class": "Grade 4B"
}
```

**Behavior:**

- **Teacher upsert:** `prisma.teacher.upsert` ensures a teacher row exists and keeps the latest name.
- **Activity upsert:**
  - Uses the composite unique constraint `teacherId_activityType_createdAt`.
  - `upsertActivity()`:
    - `create`: inserts new activity when no duplicate exists.
    - `update`: updates `subject` and `class` if a duplicate is found.
- This guarantees:
  - **No crashes** (`upsert` handles unique constraint).
  - **Idempotent ingestion** of activity feed data, even with duplicates.

### 5. `GET /api/teachers`

Returns the list of teachers for dropdowns and selector UIs.

**Response:**

```json
[
  { "id": "t1", "name": "Alice Johnson" },
  { "id": "t2", "name": "Rahul Verma" }
]
```

---

## Duplicate Handling Strategy

The **hidden twist** (duplicate entries) is handled at multiple levels:

1. **Database-level unique constraint**
   - In `Activity`:
     - `@@unique([teacherId, activityType, createdAt])`
   - Prevents two identical `(teacher, type, timestamp)` records.

2. **Idempotent `upsert` logic**
   - `upsertActivity()` (in `teacherService.ts`) uses:
     - `prisma.activity.upsert` with:
       - `where: { teacherId_activityType_createdAt: { ... } }`
       - `create: { ... }`
       - `update: { subject, class }`
   - If a duplicate hits the API:
     - The existing row is updated, not duplicated.
     - The API responds with `201` and the final row.

3. **Graceful error handling**
   - The `POST /api/activity` route:
     - Validates input with Zod before hitting the DB.
     - Wraps logic in try/catch; returns `500` with a friendly message instead of crashing the server.

This makes the ingestion pipeline safe for **replays, retries, and batched imports**.

---

## Frontend Dashboard UX

### Admin Overview Dashboard (`/dashboard`)

- **Layout**
  - Persistent sidebar on the left (logo/title, Overview nav).
  - Main content area is card-based, with responsive grid.
  - Works well from mobile up to large desktop widths.

- **Overview Metrics**
  - **Total teachers**
  - **Total lessons**
  - **Total quizzes**
  - **Total assessments**
  - Implemented in `OverviewCards.tsx`, using `getOverviewStats()` on the server.

- **Weekly Activity Trends**
  - Line chart (`WeeklyActivityChart.tsx`) using **Recharts**:
    - Lines for `lessons`, `quizzes`, `assessments`.
    - `DATE_TRUNC('week', createdAt)` used in the DB query.
    - X-axis: week start label; Y-axis: counts.
  - Global view on the dashboard plus a per-teacher version inside the insights panel.

### Per-Teacher Analysis

Implemented in `TeacherInsightsPanel.tsx`:

- **Teacher selector**
  - Dropdown of teachers (id + name).
  - Uses React state with `useTransition` for smooth loading.
  - Fetches insights from `/api/teacher/:id/insights`.

- **Totals**
  - Cards showing:
    - total lessons
    - total quizzes
    - total assessments

- **Weekly breakdown**
  - `WeeklyActivityChart` with teacher-specific weekly data.

- **Class-wise breakdown**
  - `ClassBreakdownChart` (Recharts bar chart):
    - X-axis: class
    - Bars: lessons, quizzes, assessments

- **Recent activity list**
  - `RecentActivityTable` with:
    - Type badge
    - Subject
    - Class
    - Timestamp (localized)
  - Includes **pagination** (Previous/Next).
  - Uses API-level pagination from `getRecentActivities()` for scalability.

- **AI-style summary insight**
  - Generated using `generateSummaryFromWeeklyTrend()`:
    - Compares last week vs previous week.
    - Returns readable insights like:
      - `"quiz creation increased by 30% compared to last week."`
      - Or `"Activity levels were relatively stable compared to last week."` when changes are small.

### Loading, Error, and Empty States

- **Loading**
  - `dashboard/loading.tsx` – skeleton cards and charts while initial data loads.
  - Per-teacher panel shows a loading message while fetching insights.

- **Error boundaries**
  - `dashboard/error.tsx` – user-friendly error screen with **Try again** button, logging error to console.

- **Empty states**
  - Weekly chart shows message when no activities exist.
  - Teacher panel shows:
    - “No teachers found yet” when teacher list is empty.
    - “No class-level activity yet” when breakdown is empty.
    - “No recent activity for this teacher” when no rows.

---

## Performance & Scalability

- **Aggregation in DB**
  - All heavy analytics (weekly grouping, per-class aggregation, totals) happens via:
    - `DATE_TRUNC` + `SUM(CASE WHEN ...)`
    - `GROUP BY` and indexes
  - The frontend only renders small, pre-aggregated result sets.

- **Avoiding N+1**
  - Routes do **not** loop over teachers/activities and issue individual queries.
  - Aggregations and counts are done in a few bulk queries.
  - `getTeacherInsights()` performs four parallel DB calls via `Promise.all`.

- **Pagination**
  - Recent activity is paginated at the database level using:
    - `skip` / `take`
    - `orderBy: { createdAt: "desc" }`
  - API returns `total`, `page`, and `pageSize` to drive the UI.

- **Connection pooling**
  - `src/lib/prisma.ts` uses `pg.Pool` (max 10 connections) and `PrismaPg` adapter.
  - In development, a singleton PrismaClient is stored on `global` to avoid hot-reload leaks.

- **Server components**
  - Dashboard page (`/dashboard`) is a server component:
    - Calls services/Prisma directly for overview and global weekly data.
  - Chart components and the per-teacher insights panel are client components for interactivity only.

- **Next.js & Vercel**
  - API routes are edge/serverless-friendly and stateless.
  - Queries are properly indexed and avoid full-table scans for common filters.

Potential future improvements:

- Add caching (e.g., `next: { revalidate: 60 }` or Redis) for overview and weekly stats.
- Add role-based authentication (e.g., Clerk, Auth0, or custom).
- More advanced filters: subject, date ranges, class, department.
- Background ETL jobs for pre-aggregated materialized views for very large datasets.

---

## Environment & Database Setup

### 1. Environment variables

Create or edit the `.env` file in the project root with:

```bash
DATABASE_URL="postgres://USER:PASSWORD@HOST:PORT/DB_NAME?sslmode=require"
```

For **Neon**, you can copy the connection string from the Neon console and paste it as `DATABASE_URL`.

> Note: For local development, Prisma’s generated URLs may use the `prisma+postgres://` scheme.
> For production and for the `pg` adapter, use a standard `postgres://` URL.

### 2. Prisma migration commands

After setting `DATABASE_URL`, run:

```bash
npx prisma migrate dev --name init
```

This will:

- Create the database schema.
- Generate the Prisma client into `src/generated/prisma`.

For deployment:

```bash
npx prisma migrate deploy
```

This applies all existing migrations without generating new ones.

---

## Running the App Locally

Install dependencies:

```bash
npm install
```

Run database migrations:

```bash
npx prisma migrate dev --name init
```

Start the dev server:

```bash
npm run dev
```

Visit `http://localhost:3000/dashboard`.

You can seed some data manually via `POST /api/activity` (e.g. using Postman or curl) or by wiring a small script.

Example `curl`:

```bash
curl -X POST http://localhost:3000/api/activity \
  -H "Content-Type: application/json" \
  -d '{
    "teacherId": "t1",
    "teacherName": "Alice Johnson",
    "activityType": "LESSON",
    "createdAt": "2026-02-21T10:00:00.000Z",
    "subject": "Math - Fractions",
    "class": "Grade 5A"
  }'
```

---

## Deployment (Vercel + Neon)

### 1. Create a Neon PostgreSQL database

1. Sign up or log in to Neon.
2. Create a new project and database.
3. Copy the **PostgreSQL connection string** (standard `postgres://` URL).

### 2. Configure Prisma locally

In `.env`:

```bash
DATABASE_URL="<your-neon-postgres-connection-string>"
```

Run migrations:

```bash
npx prisma migrate deploy
```

### 3. Deploy to Vercel

1. Push this project to GitHub (or another Git provider).
2. In Vercel, create a new project linked to the repo.
3. In Vercel Project Settings → Environment Variables:
   - Add `DATABASE_URL` with the Neon connection string.
4. Trigger a deployment.

The app will be served at your Vercel URL, and `/dashboard` will be the main entry point.

### 4. Production considerations

- Configure Neon’s connection pooling for serverless usage.
- Ensure `sslmode=require` (or Neon’s default) is present in `DATABASE_URL`.
- Optionally:
  - Enable Prisma Accelerate or connection poolers for very high traffic.
  - Add observability (logging, metrics, tracing).

---

## Summary

This project implements a **production-ready Teacher Insights Dashboard** with:

- Clean separation between routes, services, and components.
- **Database-level aggregation** for weekly trends and per-teacher breakdowns.
- Robust **duplicate handling** via unique constraints and `upsert`.
- **Pagination**, indexes, and efficient queries for scalability.
- A modern, responsive admin UI with Recharts-based visualizations.

You can extend it further with authentication, custom filters, and more advanced analytics, but it is already structured to support real-world production workloads. 

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
