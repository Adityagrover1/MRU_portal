# Farm Management Portal (Simple Version)

This is a student-style full stack project for tracking livestock drug usage and checking MRL safety status.

## Stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express
- Database: Supabase (PostgreSQL)

## What This Project Does

- User login/signup with Supabase Auth
- Add and manage animals
- Log drug usage entries
- Automatically calculate MRL status (`safe`, `warning`, `exceeded`)
- View logs in a table with edit/delete
- Show simple usage analytics

## Important Simplification

All chatbot/RAG/OpenAI services were removed. This project now has only standard course-project features.

## Folder Overview

- `src/` React frontend
- `server/index.ts` basic Node/Express backend (`/api/health`)
- `supabase/migrations/` database schema and seed migrations

## Setup

1. Install packages:

```bash
npm install
```

2. Create `.env.local` with your Supabase keys:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Apply Supabase migrations in your project.

4. Run app:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173` and backend runs on `http://localhost:3001`.

## Scripts

- `npm run dev` start frontend + backend
- `npm run dev:client` start only frontend
- `npm run dev:server` start only backend
- `npm run build` build frontend
- `npm run lint` lint code
- `npm run typecheck` check TypeScript types

---

**Last Updated**: March 2026
**Version**: 1.0.0
