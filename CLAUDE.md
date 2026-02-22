# UCF Percussion Studio — Project Guide

## Project Overview

A web application for the UCF Percussion Studio (University of Central Florida). It serves three audiences:

- **Public visitors** — event listings, news, audition info, about/contact pages
- **Students & faculty** — authenticated dashboard for viewing lesson schedules, jury dates, and the music library
- **Admins** — full CRUD for events, news (posts), and the Percussion Music Library (PML); read-only student roster

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router, Turbopack) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 (`@theme` in `globals.css` — no `tailwind.config.ts`) |
| Backend | Supabase (Postgres + Auth + RLS) |
| Auth client | `@supabase/ssr` 0.8.0 |
| React | 19.2.3 |

## UCF Brand Colors

Defined as CSS custom properties in `src/app/globals.css` (`@theme` block):

```css
--color-ucf-gold:  #FFC904
--color-ucf-black: #000000
--color-ucf-white: #FFFFFF
```

Use as Tailwind utilities: `bg-ucf-gold`, `text-ucf-gold`, `text-ucf-black`, `text-ucf-white`, etc.

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/          # Login page + signIn/signOut server actions
│   ├── (public)/              # Public-facing pages (no auth required)
│   │   ├── page.tsx           # Home: hero + upcoming events + recent news
│   │   ├── about/
│   │   ├── auditions/
│   │   ├── contact/           # mailto:percussion@ucf.edu
│   │   ├── ensembles/         # Placeholder
│   │   ├── events/            # Published events, starts_at >= now
│   │   ├── news/
│   │   │   ├── page.tsx       # Published posts list
│   │   │   └── [slug]/        # Dynamic post detail page
│   │   └── library/
│   │       ├── page.tsx       # Auth-gated server component
│   │       └── LibraryClient.tsx  # "use client" search filter
│   ├── admin/                 # Admin-only (role = 'admin')
│   │   ├── layout.tsx         # AdminNav sidebar + content shell
│   │   ├── page.tsx           # Overview: 4 count stat cards
│   │   ├── events/            # CRUD: list, new, [id]/edit, actions.ts
│   │   ├── news/              # CRUD: list, new, [id]/edit, actions.ts
│   │   ├── library/           # CRUD: list, new, [id]/edit, actions.ts
│   │   ├── students/          # Read-only table (create via Supabase dashboard)
│   │   └── content/           # Coming soon placeholder
│   ├── auth/callback/         # OAuth code exchange route
│   └── dashboard/             # Authenticated user dashboard (placeholder pages)
│       ├── page.tsx
│       ├── schedule/
│       ├── library/
│       └── juries/
├── components/
│   ├── admin/
│   │   ├── AdminNav.tsx       # "use client" — usePathname active-link sidebar
│   │   └── DeleteButton.tsx   # "use client" — window.confirm before submit
│   ├── auth/
│   │   └── LogoutButton.tsx   # "use client" — wraps signOut server action
│   ├── layout/
│   │   ├── Navbar.tsx         # async server component, auth-aware
│   │   └── Footer.tsx
│   └── ui/
│       ├── EventCard.tsx      # Typed from Database["public"]["Tables"]["events"]["Row"]
│       └── PostCard.tsx       # Typed from Database["public"]["Tables"]["posts"]["Row"]
├── lib/supabase/
│   ├── client.ts              # createBrowserClient<Database>
│   └── server.ts              # async createServerClient<Database> (awaits cookies())
├── proxy.ts                   # Session-refresh proxy — NOT middleware.ts
└── types/
    └── database.ts            # Hand-written DB types (replace with supabase gen types later)
```

## Database Schema (8 tables)

All tables live in `supabase/schema.sql`. Run it once in the Supabase SQL Editor.

| Table | Purpose | Key fields |
|-------|---------|-----------|
| `users` | App users (mirrors auth.users) | `id` (FK auth.users), `role` |
| `students` | Student profiles | `user_id` (FK users), `instrument`, `enrollment_year` |
| `faculty` | Faculty profiles | `user_id` (FK users), `title`, `bio` |
| `lessons` | Private lesson schedule | `student_id`, `faculty_id`, `scheduled_at`, `duration_minutes` |
| `juries` | Jury/performance assessments | `student_id`, `semester`, `scheduled_at`, `grade` |
| `events` | Public events | `starts_at`, `ends_at`, `published` |
| `posts` | News/blog posts | `slug` (UNIQUE), `published`, `published_at`, `author_id` |
| `music_library` | Percussion Music Library | `composer`, `arranger`, `instrumentation`, `location` |

### RLS pattern

- Admins: full access via `(auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'`
- Authenticated users: read own records (students/faculty) or read all (events, posts, library)
- Anonymous: published events and posts only

### users.id note

`users.id` has no `gen_random_uuid()` default — the admin must insert the UUID that Supabase Auth assigns when creating the user.

## Authentication

- Sign-in: email + password via `supabase.auth.signInWithPassword()`
- Roles stored in `app_metadata.role` (set in Supabase dashboard) — available server-side
- `proxy.ts` guards `/dashboard/*` (any authenticated) and `/admin/*` (role = 'admin')
- `redirect()` throws internally — **never wrap in try/catch**
- `cookies()` returns a Promise in Next.js 15+ — server client factory is `async`

## Key Conventions

### Server actions pattern
```typescript
"use server";
// Parse FormData → call createClient() → call Supabase
// On error: redirect("/path?error=" + encodeURIComponent(error.message))
// On success: redirect("/path")
// redirect() is NEVER inside a try/catch
```

### Next.js 15+ async props
```typescript
// Dynamic params
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
// Search params
export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
}
```

### datetime-local inputs
Supabase returns `"2025-06-15T19:00:00+00:00"` — use `.slice(0, 16)` for `defaultValue` on `datetime-local` inputs. Empty `ends_at` → pass `null`: `(formData.get("ends_at") as string) || null`.

### Database type requirement
Every table in `src/types/database.ts` **must** include `Relationships: []`. The `@supabase/postgrest-js` `GenericTable` constraint requires this field — omitting it causes all `Insert`/`Row`/`Update` types to resolve to `never`.

### Post slugs
Auto-derived from title on every create/update using `slugify()` in `admin/news/actions.ts`. The `posts.slug` column has a UNIQUE constraint — duplicate slugs redirect with an error message.

## Environment Variables

See `.env.example`. Required:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Build & Dev

```bash
npm run dev      # development server (Turbopack)
npm run build    # production build + TypeScript check
npm run lint     # ESLint
```

Build must pass with **zero TypeScript errors**. Current route count: **28 routes**.

## Step Progress

| Step | Description | Status |
|------|------------|--------|
| 1 | Scaffold: routes, layout, Navbar, Footer | ✅ Complete |
| 2 | Auth: login/logout, OAuth callback, proxy guards | ✅ Complete |
| 3 | DB schema: `schema.sql`, TypeScript types | ✅ Complete |
| 4 | Public pages + admin CRUD | ✅ Complete |
| 5 | Student/faculty dashboard + admin lesson/jury scheduling | Pending |
