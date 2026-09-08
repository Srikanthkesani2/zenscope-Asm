# SaaS Product Analytics Dashboard — Project Plan

## 1. Scope & Evaluation Constraints

**Timeline:** 2-day internal evaluation
**Goal:** Deliver a working, deployable dashboard that ingests event data and surfaces product insights.
**Out of scope (explicitly):** complex auth (SSO/OAuth), multi-tenancy with row-level security, real-time streaming, predictive ML models, massive data volumes (>1M events).

---

## 2. Proposed Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Frontend** | Next.js 14 (App Router) + TypeScript + Tailwind CSS | Fast to scaffold, built-in routing, great for dashboards, strong TS support |
| **Backend/API** | Next.js API Routes (Route Handlers) | Monorepo advantage: one repo, one deploy, no separate server |
| **Database** | SQLite (via better-sqlite3 or Drizzle ORM) | Zero-config, portable, perfect for evaluation. Can swap to Postgres later. |
| **ORM** | Drizzle ORM | Type-safe, SQL-like, lightweight, excellent DX |
| **Charts** | Recharts | React-native, simple API, good enough for analytics |
| **State** | React Server Components + lightweight client state (Zustand if needed) | Minimize client JS, let RSC handle data fetching |
| **Ingestion** | Simple POST endpoint accepting JSON events | Realistic ingestion without over-engineering |
| **Styling** | Tailwind CSS + shadcn/ui components | Fast, consistent UI |

### Assumptions
- Single-tenant (internal tool or demo tenant) — no auth for eval.
- Data volume is small (<100K events) — SQLite performs fine.
- Events are JSON objects with a well-known schema (see Data Model).
- Analytics queries are aggregation-based (counts, funnels, retention cohorts) — no need for OLAP warehouse.

---

## 3. Data Model

### 3.1 Core Tables

```sql
-- 1. Events (immutable append-only)
events (
  id          TEXT PRIMARY KEY,     -- UUID
  user_id     TEXT NOT NULL,        -- who performed the action
  event_name  TEXT NOT NULL,        -- e.g. "signup_completed", "feature_used"
  properties  TEXT,                 -- JSON blob (e.g. { plan: "pro", source: "organic" })
  device      TEXT,                 -- e.g. "mobile", "desktop"
  country     TEXT,                 -- ISO 3166-1 alpha-2
  referrer    TEXT,
  created_at  DATETIME NOT NULL     -- event timestamp
);

-- Indexes for common query patterns
CREATE INDEX idx_events_user ON events(user_id);
CREATE INDEX idx_events_name_created ON events(event_name, created_at);
CREATE INDEX idx_events_created ON events(created_at);
```

```sql
-- 2. Derived / Pre-aggregated Metrics (optional but recommended for eval performance)
daily_metrics (
  date        DATE PRIMARY KEY,
  total_users INTEGER,
  new_users   INTEGER,
  active_users INTEGER,
  revenue     REAL,
  -- JSON for arbitrary dimensions: {"feature_x_usage": 42}
  breakdown   TEXT
);
```

### 3.2 Event Schema (JSON properties)
- `plan`: string (free, pro, enterprise)
- `source`: string (organic, paid, referral)
- `session_id`: string
- `duration_ms`: integer (for feature usage events)

### 3.3 Data Model Assumptions
- No user table — `user_id` is an opaque identifier from your app.
- Events are write-heavy; reads are aggregation-heavy.
- Retention requires cohort tracking: first_seen per user derived from events.
- No soft-deletes or updates — events are immutable.

---

## 4. API Endpoints

### 4.1 Ingestion
```
POST /api/events
Body: { "user_id": "...", "event_name": "...", "properties": {...}, "device": "...", "country": "...", "referrer": "...", "created_at": "ISO8601" }
Response: 202 Accepted { "status": "queued" }
```
- Validates input, writes to SQLite, returns immediately (async processing in real life; here sync is fine for eval).

### 4.2 Analytics (Read)
```
GET /api/analytics/overview?from=YYYY-MM-DD&to=YYYY-MM-DD
Response:
{
  "total_events": number,
  "unique_users": number,
  "new_signups": number,
  "active_users": number,
  "revenue": number,
  "top_events": [{ "event_name": string, "count": number }],
  "traffic_sources": [{ "source": string, "count": number }]
}

GET /api/analytics/events?from=YYYY-MM-DD&to=YYYY-MM-DD&event_name=optional
Response: { "series": [{ "date": string, "count": number }] }

GET /api/analytics/retention?from=YYYY-MM-DD&to=YYYY-MM-DD
Response: { "cohorts": [{ "period": string, "new_users": number, "retention_d1": number, ... }] }

GET /api/analytics/funnel
Response: { "steps": [{ "event_name": string, "count": number, "dropoff": number }] }
```

### 4.3 Admin / Seed
```
POST /api/admin/seed
Body: { "count": 1000 }
Response: { "status": "seeded", "count": 1000 }
```
- Generates realistic mock data for evaluation. Disable in production.

### 4.4 Assumptions
- All dates are UTC.
- `active_users` = unique users with events in the period.
- `new_signups` = count of `signup_completed` events.
- Revenue is derived from `purchase_completed` events where `properties.amount` is present.

---

## 5. Frontend Pages (Next.js App Router)

```
app/
  layout.tsx                 -- Root layout, nav, theme
  page.tsx                   -- Dashboard home (overview cards + charts)
  events/
    page.tsx                 -- Event trends line chart
  retention/
    page.tsx                 -- Cohort retention heatmap
  funnel/
    page.tsx                 -- Funnel visualization
  settings/
    page.tsx                 -- API key display, data reset, seed trigger
```

### Page Components (components/)
```
components/
  analytics/
    OverviewCards.tsx        -- KPI cards (DAU, revenue, etc.)
    EventTrendChart.tsx      -- Line chart (Recharts)
    TopEventsTable.tsx       -- Table of top events
    RetentionHeatmap.tsx     -- Cohort grid
    FunnelChart.tsx          -- Horizontal bar funnel
    SourceBreakdown.tsx      -- Pie/donut chart
  layout/
    Sidebar.tsx
    Header.tsx
  ui/                        -- shadcn/ui components (Button, Card, etc.)
```

---

## 6. Folder Structure

```
zenscope-asm/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── events/page.tsx
│   │   ├── retention/page.tsx
│   │   ├── funnel/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── api/
│   │   │   ├── events/route.ts
│   │   │   ├── analytics/
│   │   │   │   ├── overview/route.ts
│   │   │   │   ├── events/route.ts
│   │   │   │   ├── retention/route.ts
│   │   │   │   └── funnel/route.ts
│   │   │   └── admin/seed/route.ts
│   │   └── globals.css
│   ├── components/
│   │   ├── analytics/
│   │   ├── layout/
│   │   └── ui/
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema.ts            # Drizzle schema
│   │   │   ├── migrations/          # Drizzle migrations (if using)
│   │   │   └── index.ts             # DB connection singleton
│   │   ├── analytics/
│   │   │   ├── overview.ts          # Query builders
│   │   │   ├── retention.ts
│   │   │   ├── funnel.ts
│   │   │   └── events.ts
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts                 # Shared TypeScript types
│   └── middleware.ts                # (Optional) basic rate limiting
├── public/
│   └── favicon.ico
├── drizzle.config.ts                # Drizzle kit config
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── .env.example
└── README.md
```

---

## 7. Key Analytics Logic (Pseudocode)

### Retention
```typescript
// For each day in range:
// 1. Find users whose first event is on that day (cohort)
// 2. For each subsequent day, count how many of those users returned
// 3. Express as percentage of cohort size
```

### Funnel
```typescript
// Steps: signup_completed -> feature_used -> purchase_completed
// For each step, count unique users who reached it (ordered by event timestamp)
// dropoff = (prev_count - curr_count) / prev_count
```

### Revenue
```typescript
// Sum of (properties.amount) for events where event_name = "purchase_completed"
// Filter by date range.
```

---

## 8. Evaluation Deliverables Checklist

- [ ] Working Next.js app with 4 analytics views
- [ ] SQLite database with schema and seed data generator
- [ ] `/api/events` ingestion endpoint
- [ ] 4 analytics API endpoints (overview, events, retention, funnel)
- [ ] Clean, responsive UI with Tailwind + Recharts
- [ ] README with setup and run instructions
- [ ] Type safety (TypeScript + Drizzle)
- [ ] Ability to reset and regenerate demo data

---

## 9. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| 2 days is short | Keep UI minimal, reuse shadcn/ui, avoid custom animations |
| SQLite doesn't scale | Acknowledge in README; code is written so DB layer is swappable |
| Retention query complexity | Pre-compute cohorts in a helper table if needed, or use a simpler "weekly active by signup week" approach |
| Type safety with JSON properties | Define `EventProperties` type; cast with care or use Zod validation |

---

## 10. Open Questions for Review

1. **Authentication:** Should I include a basic mock login (admin/admin) to make it feel like a real SaaS product, or keep it fully open?
2. **Multi-tenancy:** Do you want separate tenants or just one demo workspace?
3. **Event sources:** Should the ingestion endpoint support batching (array of events) or single events only?
4. **Real-time:** Any requirement for live-updating charts (WebSocket / polling), or is polling every 30s sufficient?
5. **Data freshness:** Should I cache API responses aggressively, or always query the DB?
