# DEVELOPMENT RULES — CodeForge AI
# Permanent Project Law — NEVER BYPASS

---

## PLAN-FIRST RULE (MOST CRITICAL)

NEVER write code immediately.

Before ANY coding, file creation, refactor, install, migration, or configuration:

MUST provide:
1. What you understood
2. Detailed implementation plan
3. Files to be created / modified / untouched
4. Architecture impact
5. Database impact
6. Security impact
7. Mobile/Desktop impact
8. Risks or tradeoffs
9. Suggested better alternatives (if any)

Then STOP and wait for explicit user approval.

Approval keywords: "ok" | "approved" | "go" | "continue" | "করো" | "jaw"

WITHOUT approval — DO NOT code, edit, install, migrate, or change anything.

---

## ARCHITECTURE RULES

- Use scalable enterprise architecture
- Prefer modular, feature-based structure
- Avoid tightly coupled systems
- Maintain clean separation of concerns
- Use reusable components and utilities
- Avoid duplicated logic
- Build for long-term maintainability
- SOLID principles enforced
- Monorepo with Turborepo

### Phase-based Backend Strategy
- Phase 1-2: Supabase-first (Auth, DB, Storage, Realtime, Edge Functions, RLS)
- Phase 3+: NestJS layer added on top

---

## FRONTEND RULES

Stack: Next.js 15 | TypeScript | TailwindCSS | Shadcn UI | Zustand | React Query | Framer Motion

- Use server components where beneficial
- Use client components ONLY when needed (interactivity, hooks, browser APIs)
- Avoid unnecessary re-renders
- Optimize bundle size aggressively
- Use proper loading/skeleton states
- Build responsive-first UI
- Accessibility (a11y) is mandatory
- Use semantic HTML
- Dark mode ready from Day 1
- Never hardcode text strings — use i18n (next-intl)
- Default language: English | Secondary: Bangla

---

## BACKEND RULES

- Supabase-first architecture (Phase 1-2)
- API architecture must be scalable
- Validate ALL inputs (never trust frontend)
- Secure ALL endpoints
- Use typed responses (TypeScript everywhere)
- Proper error handling with structured error codes
- Centralized logging strategy
- Rate limiting on all public endpoints

---

## DATABASE RULES

- Supabase PostgreSQL as primary DB
- Use normalized schema
- Use proper indexes on all query columns
- Use UUIDs for all primary keys
- Add created_at, updated_at timestamps everywhere
- Add audit fields (created_by, updated_by) when needed
- Design scalable relationships
- Protect ALL data with RLS (Row Level Security) policies
- Use migrations for all schema changes — never direct edits
- ORM: Prisma (Phase 3+), Supabase client (Phase 1-2)

### Core Tables
- users
- projects
- workspaces
- messages
- ai_generations
- subscriptions
- payments
- files
- logs

---

## SECURITY RULES (NEVER OPTIONAL)

- RLS policies on ALL tables
- Auth validation on ALL protected routes
- Role-based access control (RBAC)
- Secure secrets — env variables only, never hardcode
- Environment variable validation at startup
- CSRF awareness
- XSS prevention
- SQL injection protection
- API rate limiting
- Secure file upload validation
- JWT rotation
- Refresh token secure storage
- Audit logs for sensitive operations
- Helmet middleware (Phase 3 NestJS)

---

## AI SYSTEM RULES

- Modular AI architecture
- Separate prompts from business logic
- Maintain prompt versioning system
- Support future model providers (pluggable)
- Build token tracking and metering system
- Build streaming-ready architecture from Day 1
- Design reusable AI orchestration layer

### Supported Models
- Primary: OpenAI GPT
- Secondary: Claude, Gemini, DeepSeek

### Libraries
- Vercel AI SDK (streaming)
- LangChain (orchestration)
- OpenAI SDK

---

## PERFORMANCE RULES

Always optimize for:
- Fast initial load (LCP < 2.5s)
- Good Lighthouse score (90+)
- SEO readiness
- Image optimization (next/image always)
- Query optimization
- Lazy loading (dynamic imports)
- Caching strategy (Redis Phase 3+, React Query client-side)
- Streaming where beneficial

---

## UI/UX RULES

UI must feel: Modern | Premium | Clean | Fast | Minimal | Enterprise-grade

Avoid:
- Clutter
- Inconsistent spacing
- Random color usage
- Poor typography
- Weak visual hierarchy

Standards:
- Consistent design tokens (colors, spacing, typography)
- Shadcn UI as component base
- Framer Motion for micro-animations
- Skeleton loaders for all async states
- Error boundaries for all async components
- Toast notifications for all user feedback

---

## DEVICE CONSISTENCY RULE

Desktop and Mobile MUST ALWAYS have:
- Same features
- Same permissions
- Same navigation access
- Same menu structure
- Same capabilities

UI adapts responsively — functionality NEVER differs.

---

## CODE QUALITY RULES

Mandatory:
- Strong TypeScript typing (no `any` unless absolutely unavoidable)
- ESLint enforced
- Prettier enforced
- Husky pre-commit hooks
- Commitlint for commit messages
- Clean naming conventions (camelCase variables, PascalCase components, kebab-case files)
- No dead code
- No unnecessary comments (code must be self-documenting)
- Reusable utilities in packages/utils
- Proper folder organization (feature-based)

---

## NAMING CONVENTIONS

| Type | Convention | Example |
|------|-----------|---------|
| Files | kebab-case | `user-profile.tsx` |
| Components | PascalCase | `UserProfile` |
| Variables/Functions | camelCase | `getUserById` |
| Constants | UPPER_SNAKE_CASE | `MAX_TOKENS` |
| Types/Interfaces | PascalCase | `UserProfile` |
| Database tables | snake_case | `user_profiles` |
| Environment vars | UPPER_SNAKE_CASE | `NEXT_PUBLIC_SUPABASE_URL` |

---

## FOLDER CONVENTIONS

```
apps/
  web/               ← Next.js 15 frontend
    src/
      app/           ← App Router pages
      components/    ← Shared UI components
      modules/       ← Feature modules (auth, ai, projects, etc.)
      hooks/         ← Custom React hooks
      services/      ← API service calls
      store/         ← Zustand stores
      lib/           ← Library configs (supabase, etc.)
      types/         ← App-specific types
      utils/         ← App-specific utilities
      i18n/          ← Translation files
  api/               ← NestJS backend (Phase 3+)
  admin/             ← Admin dashboard (Phase 3+)
packages/
  ui/                ← Shared Shadcn components
  config/            ← Shared ESLint, TS, Tailwind configs
  types/             ← Shared TypeScript types
  utils/             ← Shared utility functions
```

---

## I18N RULES

- Use next-intl for internationalization
- Never hardcode strings in components
- Translation files in: `apps/web/src/i18n/messages/`
- Supported: `en.json` (English), `bn.json` (Bangla)
- Architecture supports future languages

---

## GIT & WORKFLOW RULES

Branch strategy:
- `main` — production
- `staging` — pre-production
- `develop` — active development
- `feature/*` — feature branches
- `fix/*` — bug fixes
- `chore/*` — maintenance

Commit format: `type(scope): description`
Examples:
- `feat(auth): add Google OAuth login`
- `fix(ai): resolve streaming timeout issue`
- `chore(deps): update dependencies`

---

## REFACTORING RULES

- Refactor when a module exceeds 300 lines
- Refactor when logic is duplicated 3+ times
- Always suggest refactor before it becomes technical debt
- Refactor must not change behavior — only structure

---

## SCALABILITY RULES

Phase 1: Monolith (Supabase-first)
Phase 2: Modular Monolith
Phase 3: NestJS + Microservice preparation
Phase 4: Event-driven architecture (Redis Pub/Sub, queues)

---

## FINAL EXECUTION PRIORITY

1. Security
2. Architecture quality
3. Scalability
4. Maintainability
5. Performance
6. UX quality
7. Developer experience
8. Speed of implementation
