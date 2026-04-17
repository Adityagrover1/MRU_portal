# Farm MRL Portal - Technical Project Document

Branch scope: wt

## 1. System Overview
Farm MRL Portal is a full-stack web application for antimicrobial drug usage tracking and residue-risk monitoring in livestock operations.

Primary objective:
- Record drug administrations against animals and calculate time-aware compliance status relative to FSSAI-aligned MRL rules.

## 2. Architecture
### 2.1 High-Level Components
- Frontend: React + TypeScript + Vite
- Backend API: Express + TypeScript runtime (tsx)
- Data/Auth Platform: Supabase (PostgreSQL + Auth + RLS)

### 2.2 Request Flow
1. User authenticates via Supabase Auth in frontend.
2. Frontend obtains access token from session.
3. Frontend calls Express API endpoints with `Authorization: Bearer <token>`.
4. Express verifies token via Supabase Auth API.
5. Express performs user-scoped data operations through Supabase.
6. Express enriches log responses with live MRL computation payload.

## 3. Current Responsibility Split
### 3.1 Frontend (Client)
- UI rendering, forms, interaction states.
- Session lifecycle (login/signup/signout) via Supabase Auth client.
- API consumption through `src/lib/api.ts`.

### 3.2 Express Backend (Server)
- All business/data endpoints for animals, logs, and reference data.
- Authorization enforcement per request using bearer token validation.
- Server-side payload validation for drug usage requests.
- MRL computation execution for create/update and response enrichment.

### 3.3 Supabase
- Identity provider (Auth).
- Data store and schema owner.
- Row-level security boundary.

## 4. Key Source Modules
### 4.1 Frontend
- `src/App.tsx`: auth-gated page routing.
- `src/contexts/AuthContext.tsx`: Supabase auth wrapper.
- `src/lib/api.ts`: authenticated API client to Express.
- `src/pages/Dashboard.tsx`: log fetch/stats orchestration via API.
- `src/components/AnimalManager.tsx`: animals CRUD via API.
- `src/components/forms/DrugUsageForm.tsx`: create/update drug logs via API.
- `src/components/tables/MRLStatusTable.tsx`: display using server `live_mrl`.
- `src/components/common/UsageChart.tsx`: distribution using server `live_mrl`.
- `src/lib/calculations/mrlCalculator.ts`: MRL logic implementation (imported by server).

### 4.2 Backend
- `server/index.ts`: Express app, auth middleware, API routes, MRL enrichment.

### 4.3 Database/Migrations
- `supabase/migrations/20260307102001_create_farm_management_tables.sql`
- `supabase/migrations/20260307102610_fix_security_performance_issues.sql`
- `supabase/migrations/20260310000000_add_animals_table.sql`
- `supabase/migrations/20260311000000_fix_drug_list.sql`

## 5. API Surface (Implemented)
Base: `http://localhost:3001`

Public:
- `GET /api/health`

Authenticated:
- `GET /api/reference-data`
- `GET /api/animal-types`
- `GET /api/animals`
- `POST /api/animals`
- `PATCH /api/animals/:id`
- `DELETE /api/animals/:id`
- `GET /api/drug-usage-logs`
- `POST /api/drug-usage-logs`
- `PATCH /api/drug-usage-logs/:id`
- `DELETE /api/drug-usage-logs/:id`

Notes:
- Token is required for all non-health endpoints.
- `drug-usage-logs` responses are enriched with `live_mrl` object.

## 6. Data Model Snapshot
Core tables:
- `animal_types`
- `drugs`
- `mrl_limits`
- `animals`
- `drug_usage_logs`

Critical relationships:
- `drug_usage_logs.user_id -> auth.users.id`
- `drug_usage_logs.drug_id -> drugs.id`
- `drug_usage_logs.animal_type_id -> animal_types.id`
- `drug_usage_logs.animal_id -> animals.id` (nullable)
- `mrl_limits` pairs `drug_id` + `animal_type_id`

## 7. Security Model
- Authentication: Supabase JWT session from client.
- API authorization: Express `requireAuth` middleware validates bearer token.
- Data isolation: Supabase RLS remains active and user-scoped.
- Server uses user-scoped Supabase client per request with bearer token forwarding.

## 8. MRL Computation Model
Implementation: `src/lib/calculations/mrlCalculator.ts`

Behavior summary:
- Uses drug + animal type + dose + administration date.
- Computes time-aware status (`safe`, `warning`, `exceeded`).
- Exposes helper metrics (`daysElapsed`, `daysUntilSafe`, etc.) through `live_mrl`.

Operational change in this branch:
- MRL decision logic is now executed in Express request flow for write operations and read enrichment (not only in UI).

## 9. Branch Delta (wt)
### 9.1 Express-first Business Logic Migration
- Frontend direct table CRUD replaced by Express API consumption.
- Added authenticated API client (`src/lib/api.ts`).
- Dashboard, AnimalManager, DrugUsageForm rewired to API endpoints.
- Table/chart components consume `live_mrl` from server response.

### 9.2 UI/UX
- Header extracted as a reusable component and made persistent on scroll.
- Backend connection label removed from header.

## 10. Runtime and Build
Prerequisites:
- Node.js + npm
- `.env.local` with:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

Commands:
- `npm install`
- `npm run dev` (runs Vite client + Express server concurrently)
- `npm run typecheck`
- `npm run lint`
- `npm run build`

Runtime endpoints:
- Frontend: `http://localhost:5173`
- API: `http://localhost:3001`

## 11. Verification Checklist
- Auth succeeds and dashboard loads.
- Animals CRUD works through API.
- Drug log create/update/delete works through API.
- Table and chart reflect `live_mrl`-derived status.
- Header remains visible during scrolling.
- `npm run typecheck` and `npm run build` pass.

## 12. Limitations
- Compliance output is model-based, not laboratory residue measurement.
- No reporting/export pipeline yet.
- Some non-blocking lint warnings remain (hook dependency warnings).

## 13. Next Technical Improvements
- Move calculator module to a shared location outside `src`/UI tree for cleaner server ownership.
- Add schema validation layer per endpoint (zod or equivalent).
- Add centralized error format with request IDs.
- Add pagination/filtering for logs endpoint.
- Add integration tests for API routes and auth middleware.
