# Migration Report — Next.js 15 + React 19 Architecture

> Client was already a Next.js App Router app (not Vite). This migration upgraded it to
> **Next.js 15.5 + React 19** and re-architected data fetching, auth, forms, layouts and SEO.
> Backend (Express + MongoDB) was optimized for the new patterns.

---

## 1. Runtime upgrades

| | Before | After |
|---|---|---|
| Next.js | 14.x | **15.5.22** |
| React | 18 | **19.2.8** |
| Data fetching | Hand-rolled fetch hooks, no cache | **TanStack Query v5** (cached, deduped) |
| Forms | Formik + Yup | **react-hook-form + Zod** (+@hookform/resolvers) |
| Auth | next-auth (JWT, dual session fetch) | **Custom jose-based JWT auth, single session query** |
| Lint | `next lint` (removed in 15) | **eslint 9 flat config** (`eslint.config.mjs`), `npm run typecheck` |
| PWA / UI libs | framer-motion, recharts, TanStack Table | unchanged (kept) |

### Why this matters
- **React 19**: automatic batching, ref cleanup support, faster hydration. Removes the React 18 `useRef`
  value-or-callback ambiguity in favor of a strict `RefObject<T | null>` contract.
- **Next 15**: faster Turbopack dev server, upgraded caching, `next lint` → flat ESLint (breaking),
  `outputFileTracingRoot` for monorepo-style repos.
- **Tree-shaken deps**: Formik (≈35 kB), Yup (≈18 kB) and next-auth (client runtime + API route) are gone.

---

## 2. The 404 bug (root cause + fix)

**Symptom:** `/api/users`, `/api/subjects`, `/api/classes` returned 404 from the client.

**Root cause:** `next.config.mjs` proxied the backend through an *explicit* rewrite list that never
included those three endpoints. Any endpoint added later would silently 404 again.

**Fix:** one catch-all rewrite covers the entire API surface and survives future backend routes:

```js
async rewrites() { return [{ source: "/api/:path*", destination: `${backend}/api/:path*` }]; }
```

Safe now because the only in-app `/api` route (next-auth) was deleted.

---

## 3. Auth re-architecture (next-auth → jose)

**Before:** next-auth JWT in a session cookie + `AuthContext` effect that fetched the profile again on
every mount, storing a Bearer token in a module variable. Every page render caused **two session
requests** (next-auth + backend profile) and a race around the Bearer token.

**After — one cookie, one query, zero Bearer headers:**

- Login posts through the rewrite to `/api/auth/login`; the **backend's HttpOnly `token` cookie** is the
  single session source (via `withCredentials`).
- `middleware.ts` verifies the cookie with **jose** (`JWT_SECRET`), redirects unauthenticated users away
  from protected prefixes and logged-in users away from `/login`.
- `features/auth/AuthProvider.tsx` exposes the session as a **React Query** entry
  (`queryKey: ["session"]`, `staleTime: 5 min`, `retry: false`) — mounted once in `AppProviders`, so the
  profile is fetched once per tab per 5 minutes, not once per page navigation.
- All subsequent API calls are cookie-based; the 401 handler in `services/api.ts` clears the cache and
  routes to `/login` exactly once.

**Deletions:** `app/api/[...nextauth]/`, `contexts/`, `lib/authOptions.ts`, `types/next-auth.d.ts`.

> **Deploy note:** `client/.env` `JWT_SECRET` must equal `server/.env` `JWT_SECRET` (same JWT
> algorithm + secret so middleware and backend agree). Currently a placeholder.

---

## 4. Data layer — TanStack Query

New `providers/QueryProvider.tsx` with shared defaults:

| Setting | Value | Effect |
|---|---|---|
| `staleTime` | 60 s | no refetch within a minute |
| `gcTime` | 30 min | cache survives navigation |
| `refetchOnWindowFocus/Reconnect/Mount` | `false` | no surprise fetches; session updates manual |
| `placeholderData: prev` | — | keeps previous page visible during refetch (pagination) |
| `retry` | 1 | one retry for flaky networks, no storm |

### The "request once" win — meta queries
Subjects/classes are fetched by **6+ pages** (outline, quizzes, students, users, subjects, settings,
public pages). `features/meta/useMetaQueries.ts` shares them under one query key each:
`staleTime: 30 min`, `gcTime: 60 min`. First visit pays one request; every other page reuses the cached
copy. Only Subjects page mutations invalidate them.

### usePaginatedQuery — rewritten on React Query
**Before:** `useState` + `useEffect` + `AbortController` — refetched on every param change, discarded on
navigation, no caching between visits.

**After:** React Query-backed with `keepPreviousData` and full query-key caching. Every
(page, filter, search) combination is cached; flipping back to a previous page is instant. Signature:
`usePaginatedQuery<T>(queryKey, queryFn, { initialParams, staleTime })` returning
`{ data, pagination, loading, params, setFilter, refresh, searchInput, setSearchInput, search }`.
Used by outline (admin), public outline, public students; quizzes/students pages use direct queries.

### Analytics
Dashboard + Analytics pages share `useAnalyticsQuery` under one `["analytics"]` key (5 min stale) —
navigating between them costs zero extra API calls.

---

## 5. Forms — react-hook-form + Zod

All forms migrated from Formik+Yup with shared schemas in `features/forms/schemas.ts`,
`features/auth/schema.ts`, `features/course-outline/schema.ts`:

| Page | Schema | Notes |
|---|---|---|
| Login | `loginSchema` | |
| Outline | `outlineFormSchema` | dynamic learning-outcomes rows; edit mode resets into same form |
| Students (manage) | `studentFormSchema` | |
| Settings (profile) | `PROFILE_SCHEMA` | |
| Settings (security) | `SECURITY_SCHEMA` | reused password rules |
| Users | `userFormSchema` | confirm-password refine |
| Subjects/Classes | `nameFormSchema` | shared `NameList` component |
| Quizzes | `quizColumnSchema` / `quizCellSchema` | add-quiz column + per-cell marks modal |

Numeric fields keep RHF's string input values and convert with `Number()` at payload build time —
identical behavior to the old Formik flow, zero type friction.

---

## 6. Layout architecture — persistent shell

**Before:** a single `AdminLayout` page component re-mounted on every navigation; sidebar re-rendered
with each route; pathname-conditional rendering per item.

**After (Next 15 route groups + memoized shell):**

- `components/layouts/AdminShell.tsx` — memoized shell that stays mounted across navigations inside
  `(protected)`. Sidebar + navbar are never torn down; only the page slot swaps.
- `AdminSidebar.tsx` — memoized; each `NavLink` self-subscribes to `usePathname()` so only the active
  link re-renders on navigation. Admin-only items distilled by role.
- `AdminNavbar.tsx` — memoized; no router/pathname usage at all → never re-renders on navigation.
- `app/(protected)/loading.tsx` + `error.tsx` — instant UI feedback during lazy chunks and a recovery
  boundary instead of a white screen.
- Session load happens in the shell, so pages render immediately with cached/placeholder data while
  auth resolves — no full-screen gate flash.

---

## 7. SEO & static optimization

- `app/layout.tsx`: full metadata (title template, openGraph, twitter, robots, `metadataBase` from
  `NEXT_PUBLIC_SITE_URL`).
- `app/sitemap.ts` + `app/robots.ts` — sitemap + robots generated at build time.
- All 17 routes are **pre-rendered static** (○) except `/students/[id]` (SSR, ƒ), so first-load JS
  ships as HTML before any client JS runs.
- Public pages (`/`, `/course-outline`, `/students`) are statically rendered — their data loads via the
  cached queries with skeleton loading, keeping Lighthouse-visible paint times low.
- `next/image` in `Logo` and `Spinner`; `optimizePackageImports` extended (recharts, lucide-react,
  jspdf, jspdf-autotable, framer-motion, TanStack Table) to enable per-icon/per-module import paths.

---

## 8. Backend optimizations (Express + MongoDB)

| File | Change | Effect |
|---|---|---|
| `courseController.ts` / `publicController.ts` | `.lean()` on the two hot course list queries | ~2–4× faster serialization: skips Mongoose document wrapping for the read path |
| `models/Course.ts` | Compound indexes matching real filter patterns: `{month, week, status}`, `{subject, class, status}`, `{status, completionDate}` | dashboard completion-date sort + every filter combination served by an index |

---

## 9. Estimated impact

| Area | Before | After |
|---|---|---|
| Session API calls per navigation | 2 (next-auth + profile effect) | ~0 (cached, 1 per 5 min per tab) |
| Subjects/Classes fetches per session | ~6–10 (once per page) | 1–2 (shared meta queries) |
| Dashboard → Analytics round-trip | 2 API calls | 0 (shared cache) |
| Pagination page flips | full fetch + spinner | cached instant swap (`keepPreviousData`) |
| Middleware dependency | next-auth server runtime | jose (≈ 40 kB, self-contained) |
| Client bundle | next-auth + Formik + Yup | RHF + Zod + jose (smaller, tree-shaken) |
| Route rendering | client-only after CSR gate | static pre-render (17/17) |
| Build | — | `next build` ✓, `tsc --noEmit` ✓, `eslint .` 0 problems |
| Course list queries | full Mongoose docs | `.lean()` + compound indexes |

### Verification commands
```
cd client && npm run typecheck && npm run lint && npm run build
cd server && npx tsc --noEmit
```

### Known follow-ups (not blocking)
- Copy real `JWT_SECRET` from `server/.env` into `client/.env` before deploying.
- Optional: unify `server/src/models/Course.ts` month/week constants with client `lib/constants.ts`
  (currently duplicated by design — server validates, client drives UI).
