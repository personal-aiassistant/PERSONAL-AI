# DEVELOPMENT TASKS — CodeForge AI
# Master Development Tracker

---

## 📊 Project Overview

**Project:** CodeForge AI
**Type:** AI-powered Developer Productivity SaaS Platform
**Architecture:** Supabase-first (Phase 1-2) → NestJS (Phase 3+)
**Monorepo Tool:** Turborepo
**Started:** 2026-05-20

---

## ✅ COMPLETED

### [TASK-001] Project Foundation Setup
- **Completed:** 2026-05-20
- **What was implemented:**
  - Created DEVELOPMENT_RULES.md (permanent project law)
  - Created DEVELOPMENT_TASKS.md (this file — master tracker)
  - Created replit.md (project overview + preferences)
  - Initialized Turborepo monorepo structure
  - Set up Next.js 15 app with TypeScript
  - Configured TailwindCSS + Shadcn UI
  - Set up ESLint + Prettier
  - Created .env.example with all required variables
  - Set up i18n structure (next-intl) with English + Bangla
  - Created feature-based folder structure
  - Set up Supabase Auth client configuration
- **Files Created:** DEVELOPMENT_RULES.md, DEVELOPMENT_TASKS.md, replit.md, turbo.json, package.json (root), apps/web/ (full Next.js setup), packages/ui/, packages/config/, packages/types/, packages/utils/, .env.example, .gitignore
- **Architectural Impact:** Monorepo foundation established. All future apps/packages plug into this structure.
- **Important Notes:** Supabase-first for Phase 1-2. NestJS added in Phase 3.

### [TASK-002] Authentication System + Database Schema — Phase 1
- **Completed:** 2026-05-20
- **What was implemented:**
  - Database schema migrated to Replit PostgreSQL (5 tables)
  - Auth: Supabase Auth (Email + Google OAuth + GitHub OAuth)
  - Profile auto-creation on first login via `/api/profile`
  - Workspace auto-creation for new users (with owner membership)
  - Auth state listener (useAuthListener hook) — real-time Supabase session sync
  - Zustand store updated with profile state
  - Dashboard connected to real stats via `/api/dashboard/stats`
  - API routes: /api/profile (GET, PATCH), /api/projects (GET, POST), /api/dashboard/stats
  - Login, Register, Forgot Password pages — fully functional
  - Auth Background + animated form components
  - Dark mode ready, i18n (English + Bangla)
- **Architecture Decision:** Replit PostgreSQL for app data (Supabase IPv6 direct connection blocked in Replit env). Supabase used for Auth only. Data access via Next.js API routes (server-side auth verification).
- **Files Created:**
  - `supabase/migrations/001_initial_schema.sql` (updated — Replit DB version)
  - `supabase/migrations/002_rls_policies.sql` (Supabase RLS — for future Supabase DB migration)
  - `apps/web/src/lib/db.ts` (pg Pool singleton)
  - `apps/web/src/lib/auth-helpers.ts` (requireAuth, getOrCreateProfile)
  - `apps/web/src/hooks/use-auth.ts` (auth state listener)
  - `apps/web/src/hooks/use-profile.ts` (profile query/mutation)
  - `apps/web/src/hooks/use-dashboard-stats.ts` (stats query)
  - `apps/web/src/app/api/profile/route.ts`
  - `apps/web/src/app/api/dashboard/stats/route.ts`
  - `apps/web/src/app/api/projects/route.ts`
- **Files Modified:**
  - `apps/web/src/store/auth-store.ts` (added profile state)
  - `apps/web/src/components/providers.tsx` (added AuthProvider)
  - `apps/web/src/components/layout/user-menu.tsx` (real profile data)
  - `apps/web/src/modules/dashboard/components/dashboard-content.tsx` (real stats)
- **Architectural Impact:** All DB operations go through server-side API routes. Auth verified via Supabase on every protected request. Profile/workspace auto-created on first login.
- **Important Notes:** When Supabase IPv6/pooler issue resolves, run 002_rls_policies.sql to add RLS layer.

---

## 🔄 IN PROGRESS

### [TASK-006] Project Generator / AI Tools — Phase 2

---

## ✅ RECENTLY COMPLETED

### [TASK-003] Database Schema ✅ — completed inside TASK-002

### [TASK-004] Basic UI Shell — Completed 2026-05-20
- App layout (sidebar, header, app-shell) ✅
- Dashboard shell with real stats ✅
- Dark mode toggle ✅
- Responsive navigation ✅
- Error boundary component ✅
- 404 not-found page ✅
- Toast (Sonner) ✅
- Shadcn components: card, badge, avatar, dialog, dropdown-menu, tabs, textarea, tooltip, progress, alert ✅
- Projects page (full CRUD: list, search, create, archive, delete) ✅
- Settings page (profile, appearance, notifications, security tabs) ✅
- Billing page (Free/Pro/Team plans with usage tracking) ✅

### [TASK-005] AI Chat System — Completed 2026-05-20
- AI SDK (Vercel ai@4.x + @ai-sdk/openai) integrated ✅
- Streaming response via `/api/ai/chat` ✅
- useChat hook from `ai/react` ✅
- Chat history saved to Replit PostgreSQL ✅
- Multi-model selector (GPT-4o, GPT-4o Mini, GPT-4 Turbo, GPT-3.5 Turbo) ✅
- Chat sidebar with session management ✅
- Starter prompts for empty state ✅
- Code block rendering with copy button ✅
- Stop streaming button ✅
- API key missing detection + friendly warning ✅
- `/api/ai/history` (GET + DELETE) ✅

---

## ⏳ PENDING

### [TASK-006] Project Generator / AI Tools — Completed 2026-05-20
- 7 AI generator tools: Architecture, PRD, API Builder, Schema, Docker, CI/CD, Documentation ✅
- Specialized system prompts per tool ✅
- Streaming generation via `/api/generators/generate` ✅
- Generator history saved to DB with tokens tracked ✅
- Regenerate & download output ✅
- Sidebar "AI Tools" group with collapsible nav ✅
- `generators` table in Replit PostgreSQL ✅

### [TASK-007] Workspace System — Completed 2026-05-20
- Workspace detail page (members, activity, settings tabs) ✅
- Team member management (view, role change, remove) ✅
- Invite system: generate invite link, accept via `/invite/[token]` ✅
- `workspace_invitations` + `activity_logs` tables ✅
- Activity log feed with icons + relative timestamps ✅
- Workspace settings form (name, description) ✅
- API routes: GET/PATCH workspace, GET/PATCH/DELETE members, POST invite, GET/POST activity ✅
- Note: Supabase Realtime skipped (IPv6 blocked) — polling fallback used ✅

### [TASK-008] Billing System — Completed (2026-05-21)
- Billing page with plan cards (Free/Pro/Team) ✅
- Real usage tracking from DB (/api/usage) ✅
- Token usage progress bars ✅
- Generator breakdown by type ✅
- Note: Payment gateway (Stripe) skipped — no credentials available. UI shows upgrade flow. ✅

### [TASK-009] NestJS Backend Layer — Completed 2026-05-20
- NestJS setup in `apps/api` (port 3001) ✅
- Prisma ORM integration (shared Replit PostgreSQL) ✅
- Auth module: JWT strategy using Supabase JWT secret, auto-profile creation ✅
- Projects module: full CRUD + stats endpoint ✅
- AI module: streaming chat + streaming generators (7 types) ✅
- Billing module: plan management, usage tracking, upgrade endpoint ✅
- Analytics module: dashboard stats, token trends, generator breakdown ✅
- Health module: `/health` and `/health/ping` ✅
- Swagger docs at `/api/docs` ✅
- Global pipes (validation), filters (HTTP exception), interceptors (response, logging) ✅
- CORS configured for frontend ✅
- Frontend API client: `apps/web/src/lib/api-client.ts` ✅
- Workflow: "Start API" (port 3001, console output) ✅
- `apps/api/prisma/schema.prisma` — full schema (Profile, Workspace, Project, Generator, ChatHistory, UsageLog) ✅
- New env vars: `NEXT_PUBLIC_API_URL`, `SUPABASE_JWT_SECRET`, `PORT` ✅
- **Architectural Impact:** All future Phase 3+ features will go through NestJS API. Next.js routes kept for auth-sensitive/SSR operations.

### [TASK-010] Realtime Collaboration — Completed 2026-05-20
- NestJS NotificationsModule: SSE stream + full CRUD (list, unread count, mark read, delete) ✅
- NestJS PresenceModule: heartbeat endpoint, last_seen tracking, workspace presence ✅
- DB tables: `notifications`, `user_presence` created ✅
- Frontend `useNotifications` hook (polling every 30s) ✅
- Frontend `usePresence` hook (heartbeat every 60s, offline on unload/hidden) ✅
- NotificationBell component in header: unread badge, dropdown panel, mark-all-read, delete ✅
- PresenceProvider in app providers ✅
- Note: SSE requires cross-origin auth (polling fallback fully functional) ✅

### [TASK-011] Analytics System — Completed 2026-05-20
- Analytics dashboard page at `/analytics` ✅
- recharts installed + integrated ✅
- Token usage trends: AreaChart (30-day daily breakdown) ✅
- Generator type distribution: PieChart (all-time) ✅
- Tokens by type this month: BarChart ✅
- Daily API requests BarChart ✅
- Token limit progress bar with plan badge ✅
- Recent activity feed (last 5 generations) ✅
- Stat cards: projects, tokens, generations, chat messages ✅
- Analytics sidebar link + i18n (English + Bangla) ✅
- Powered by NestJS analytics endpoints ✅
- Graceful fallback when API is offline ✅
- `date-utils.ts` utility (formatDistanceToNow, formatDate, formatDateTime) ✅

---

## 🚫 BLOCKED

*(Nothing blocked yet)*

---

### [TASK-012] Admin Dashboard — Completed 2026-05-21
- NestJS AdminModule with role-based access (admin role check on every endpoint) ✅
- `GET /api/v1/admin/stats` — system-wide: users, projects, generations, tokens, plan breakdown ✅
- `GET /api/v1/admin/users` — paginated user list with search ✅
- `PATCH /api/v1/admin/users/:id/plan` — update any user's plan ✅
- `PATCH /api/v1/admin/users/:id/role` — promote/demote user role ✅
- `GET /api/v1/admin/signups` — daily signup trend data (30-day) ✅
- `role` column added to `profiles` table (default: "user") ✅
- Frontend `/admin` page with stat cards, charts (AreaChart, PieChart), user table, pagination ✅
- Admin sidebar link + i18n (EN+BN) ✅
- Non-admin users see "Access denied" screen gracefully ✅

### [TASK-013] Code Review AI Tool (8th Generator) — Completed 2026-05-21
- `code-review` type added to GeneratorType enum (DTO + service) ✅
- Specialized system prompt: covers security (OWASP), performance, type safety, error handling, design patterns ✅
- Output: severity ratings (critical/major/minor), corrected code snippets, overall score + action list ✅
- Frontend: `CodeReviewGenerator` component (language + code + context + focus areas fields) ✅
- Page at `/code-review` ✅
- Sidebar "Code Review" link + i18n (EN+BN) ✅
- Works with existing generator history, regenerate, download flow ✅

### [TASK-015] Global Search — Completed 2026-05-21
- NestJS `SearchModule` + `SearchController` — searches across projects, generators, AI chats ✅
- `SearchModal` component — Cmd+K shortcut, keyboard nav (↑↓↵Esc), grouped results by type ✅
- Recent searches persisted in localStorage (last 5 queries) ✅
- App header updated with Search button + Cmd+K hint ✅

### [TASK-016] Onboarding Wizard — Completed 2026-05-21
- `onboarding_completed` column added to `public.profiles` (DEFAULT false) ✅
- `/api/onboarding` POST route — marks onboarding complete in DB ✅
- `OnboardingWizard` component — 5-step animated modal (welcome, AI chat, generators, projects, finish) ✅
- `OnboardingProvider` wired into `providers.tsx` — shows wizard on first login when `onboarding_completed = false` ✅
- Auto-dismissed on complete or skip; profile state drives visibility ✅

### [TASK-014] Rate Limiting + Security Hardening — Completed 2026-05-21
- `ThrottlerBehindProxyGuard` — X-Forwarded-For aware IP tracking, globally applied ✅
- `AiThrottle` decorator — 20 req/min, 200 req/hour on AI chat + generator endpoints ✅
- `StrictThrottle` decorator — 5 req/min, 30 req/hour (available for sensitive endpoints) ✅
- `AdminThrottle` decorator — 30 req/min, 300 req/hour for admin endpoints ✅
- helmet() + compression() already active (TASK-009) ✅
- CORS restricted to known origins (localhost:5000, *.replit.dev) ✅
- JWT validation on all non-public routes via global JwtAuthGuard (TASK-009) ✅
- Custom 429 error message: "Too many requests — please slow down" ✅

---

## 🔮 FUTURE IMPROVEMENTS

- Microservice architecture migration (Phase 4)
- Event-driven system (Redis Pub/Sub)
- RAG system with vector DB (Pinecone/Weaviate)
- AI Agent system
- Multi-tenant isolation
- Custom domain support
- White-label mode
- Mobile app (React Native / Expo)
- VS Code extension
- CLI tool

---

## 💳 TECHNICAL DEBT

*(Will be tracked here as debt accumulates)*

---

## 🔒 SECURITY IMPROVEMENTS

- [ ] Security audit before Phase 3
- [ ] Penetration testing before launch
- [ ] OWASP checklist review
- [ ] Rate limiting audit
- [ ] RLS policy audit

---

## ⚡ PERFORMANCE IMPROVEMENTS

- [ ] Lighthouse audit after Phase 1 UI
- [ ] Bundle size analysis after Phase 2
- [ ] Query optimization review after Phase 3
- [ ] Redis caching strategy (Phase 3)

---

## 📅 Development Roadmap

| Phase | Weeks | Tasks |
|-------|-------|-------|
| Phase 0 | Week 0 | Foundation setup ✅ |
| Phase 1 | Week 1-2 | Auth + DB + Basic UI |
| Phase 2 | Week 3-4 | AI Chat + Streaming |
| Phase 3 | Week 5-6 | Project Generator + Billing + NestJS |
| Phase 4 | Week 7-8 | Realtime + Team features |
| Phase 5 | Week 9+ | Scaling + Analytics + Advanced AI |
