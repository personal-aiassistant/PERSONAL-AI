# CodeForge AI — Project Overview

## Project Description
AI-powered Developer Productivity SaaS Platform. A unified workspace where developers can use AI coding assistant, architecture generator, PRD generator, API builder, deployment automation, and documentation generator — all in one place.

## Architecture
- **Type:** Monorepo (Turborepo)
- **Phase 1-2:** Supabase-first (Auth, DB, Storage, Realtime, Edge Functions, RLS)
- **Phase 3+:** NestJS backend layer added

## Tech Stack
- **Frontend:** Next.js 15, TypeScript, TailwindCSS, Shadcn UI, Zustand, React Query, Framer Motion
- **Backend:** Supabase Edge Functions (Phase 1-2), NestJS (Phase 3+)
- **Database:** Supabase PostgreSQL + Redis (Phase 3+)
- **AI:** OpenAI GPT, Vercel AI SDK, LangChain
- **Auth:** Supabase Auth (Email, Google, GitHub OAuth)
- **Storage:** Supabase Storage → Cloudflare R2 (Phase 3+)
- **Deployment:** Vercel (frontend), Railway (backend Phase 3+), Supabase
- **i18n:** next-intl (English + Bangla)
- **Monorepo:** Turborepo

## Folder Structure
```
apps/
  web/     ← Next.js 15 frontend (main app)
  api/     ← NestJS backend (Phase 3+)
  admin/   ← Admin dashboard (Phase 3+)
packages/
  ui/      ← Shared Shadcn components
  config/  ← Shared configs (ESLint, TS, Tailwind)
  types/   ← Shared TypeScript types
  utils/   ← Shared utilities
```

## Development Workflow
- See: `DEVELOPMENT_RULES.md` — permanent project law
- See: `DEVELOPMENT_TASKS.md` — master task tracker

## User Preferences
- PLAN-FIRST always — present plan and wait for "ok"/"jaw"/"করো" before coding
- Supabase-first architecture (Phase 1-2), NestJS added Phase 3+
- All code in English, UI supports English + Bangla (i18n)
- Enterprise-grade, production-ready code only
- Same features on desktop and mobile always
- Dark mode ready from Day 1
- No hardcoded strings — always use i18n
- Strong TypeScript typing (no `any`)

## Environment Variables Required
See `.env.example` for full list. Key variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
