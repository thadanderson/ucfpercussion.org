# UCF Percussion Studio — Project Guide

## Project Overview

A web application for the UCF Percussion Studio (University of Central Florida). It serves three audiences:

- **Public visitors** — event listings, faculty bios, alumni directory, audition info, about/contact pages
- **Students & faculty** — authenticated dashboard for viewing lesson schedules, jury dates, and the music library
- **Admins** — full CRUD for events, faculty, alumni, and the Percussion Music Library (PML); read-only student roster

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
│   │   ├── page.tsx           # Home: hero image + upcoming events
│   │   ├── about/
│   │   ├── alumni/            # Published alumni directory (initials fallback)
│   │   ├── auditions/
│   │   ├── contact/           # Address, How to Get Here, Parking
│   │   ├── events/            # Published events, starts_at >= now
│   │   │   └── past/          # Published events, starts_at < now (linked from /events)
│   │   ├── news/
│   │   │   ├── page.tsx       # Published posts list
│   │   │   └── [slug]/        # Dynamic post detail page
│   │   └── library/
│   │       ├── page.tsx       # Auth-gated server component
│   │       └── LibraryClient.tsx  # "use client" search filter
│   ├── admin/                 # Admin-only (role = 'admin')
│   │   ├── layout.tsx         # AdminNav sidebar + content shell
│   │   ├── page.tsx           # Overview stat cards
│   │   ├── events/            # CRUD: list, new, [id]/edit, actions.ts
│   │   ├── faculty/           # CRUD: list, new, [id]/edit, actions.ts
│   │   ├── alumni/            # CRUD: list, new, [id]/edit, actions.ts
│   │   ├── library/           # CRUD: list, new, [id]/edit, actions.ts
│   │   ├── students/          # Read-only table (create via Supabase dashboard)
│   │   └── content/           # Coming soon placeholder
│   ├── auth/callback/         # OAuth code exchange route
│   └── dashboard/             # Authenticated user dashboard (placeholder pages)
│       ├── page.tsx
│       ├── profile/           # Alumni self-manage current_role, bio, etc.
│       ├── schedule/
│       ├── library/
│       └── juries/
├── components/
│   ├── admin/
│   │   ├── AdminNav.tsx       # "use client" — usePathname active-link sidebar
│   │   ├── DeleteButton.tsx   # "use client" — window.confirm before submit
│   │   ├── ImageUpload.tsx    # "use client" — Supabase Storage upload, returns public URL
│   │   └── RichTextEditor.tsx # "use client" — Tiptap editor (bold, italic, lists, links)
│   ├── auth/
│   │   └── LogoutButton.tsx   # "use client" — wraps signOut server action
│   ├── layout/
│   │   ├── Navbar.tsx         # async server component — passes isLoggedIn to NavMenu
│   │   ├── NavMenu.tsx        # "use client" — hamburger toggle, desktop + mobile nav
│   │   └── Footer.tsx
│   └── ui/
│       ├── EventCard.tsx      # Typed from events Row; renders HTML descriptions + poster image
│       ├── FacultyCard.tsx    # "use client" — expandable bio, paragraph rendering
│       ├── NewsletterSubscribe.tsx  # "use client" — Buttondown subscribe form
│       └── PostCard.tsx       # Typed from posts Row
├── lib/supabase/
│   ├── client.ts              # createBrowserClient<Database>
│   └── server.ts              # async createServerClient<Database> (awaits cookies())
├── proxy.ts                   # Session-refresh proxy — NOT middleware.ts
└── types/
    └── database.ts            # Hand-written DB types (replace with supabase gen types later)
```

## Database Schema (9 tables)

All tables live in `supabase/schema.sql`. Run it once in the Supabase SQL Editor.

| Table | Purpose | Key fields |
|-------|---------|-----------|
| `users` | App users (mirrors auth.users) | `id` (FK auth.users), `role` |
| `students` | Student profiles | `user_id` (FK users), `instrument`, `enrollment_year` |
| `faculty` | Faculty profiles | `user_id` (optional FK), `title`, `bio`, `headshot_url`, `published` |
| `lessons` | Private lesson schedule | `student_id`, `faculty_id`, `scheduled_at`, `duration_minutes` |
| `juries` | Jury/performance assessments | `student_id`, `semester`, `scheduled_at`, `grade` |
| `events` | Public events | `starts_at`, `ends_at`, `published`, `image_url` |
| `posts` | News/blog posts | `slug` (UNIQUE), `published`, `published_at`, `author_id` |
| `music_library` | Percussion Music Library | `composer`, `arranger`, `instrumentation`, `location` |
| `alumni` | Alumni directory | `user_id` (optional FK), `degree`, `graduation_year`, `published` |

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

All event times are entered and displayed in **Eastern time (America/New_York)**. The `easternToISO()` helper in `admin/events/actions.ts` converts the timezone-naive datetime-local string to a proper UTC ISO before storing. `EventCard.tsx` always renders with `timeZone: "America/New_York"`.

### Event poster images
Uploaded via `ImageUpload` component to the `event-images` Supabase Storage bucket (public). The component uses `createBrowserClient`, uploads with a `Date.now()` filename to avoid collisions, and stores the public URL in a hidden input. Supabase Storage RLS requires an INSERT policy for admins on `storage.objects`.

### Rich text (event descriptions)
`RichTextEditor` uses Tiptap (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`) with `immediatelyRender: false` to avoid SSR hydration errors. Stores HTML in a hidden input. `EventCard` renders with `dangerouslySetInnerHTML`, detecting HTML vs plain text via `.includes("<")`.

### Navbar architecture
`Navbar.tsx` is a thin async server component that fetches auth state and passes `isLoggedIn` to `NavMenu.tsx` (a `"use client"` component that owns the hamburger toggle state). Nav order: About, News & Events, Audition, Alumni, Contact, Dashboard/Login.

### Faculty bios
Faculty bios are entered as plain text in a textarea. `FacultyCard.tsx` renders them with paragraph support by splitting on `\n\n` and rendering single `\n` as `<br>`. The card shows a truncated 4-line preview with a "Read more" toggle.

### Buttondown newsletter
- Subscribe form: `src/components/ui/NewsletterSubscribe.tsx` → `src/app/(public)/subscribe/actions.ts` → `POST /v1/subscribers`
- Newsletter draft: "Newsletter" button in admin events list → `createNewsletterDraft` in `admin/events/actions.ts` → `POST /v1/emails` with `status: "draft"` — redirects with a link to open the draft in Buttondown
- Requires `BUTTONDOWN_API_KEY` env var (server-side only)

### Supabase Storage buckets
- `event-images` — public bucket for event poster images
- `faculty-images` — public bucket for faculty headshots
- Both require an admin INSERT policy on `storage.objects`

### PostgreSQL reserved words
`current_role` is a reserved word in PostgreSQL — must be quoted as `"current_role"` in schema DDL.

### Database type requirement
Every table in `src/types/database.ts` **must** include `Relationships: []`. The `@supabase/postgrest-js` `GenericTable` constraint requires this field — omitting it causes all `Insert`/`Row`/`Update` types to resolve to `never`.

### Post slugs
Auto-derived from title on every create/update using `slugify()` in `admin/news/actions.ts`. The `posts.slug` column has a UNIQUE constraint — duplicate slugs redirect with an error message.

## Deployment

- **Platform:** Vercel (connected to GitHub `main` branch — auto-deploys on push)
- **Domain:** custom domain configured in Vercel; DNS managed via WordPress.com
- **Supabase auth:** production domain added to Supabase allowed redirect URLs

## Environment Variables

See `.env.example`. Required in both `.env.local` (dev) and Vercel project settings (production):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
BUTTONDOWN_API_KEY=
```

## Build & Dev

```bash
npm run dev      # development server (Turbopack)
npm run build    # production build + TypeScript check
npm run lint     # ESLint
```

Build must pass with **zero TypeScript errors**. Current route count: **35 routes**.

## Step Progress

| Step | Description | Status |
|------|------------|--------|
| 1 | Scaffold: routes, layout, Navbar, Footer | ✅ Complete |
| 2 | Auth: login/logout, OAuth callback, proxy guards | ✅ Complete |
| 3 | DB schema: `schema.sql`, TypeScript types | ✅ Complete |
| 4 | Public pages + admin CRUD | ✅ Complete |
| 4.5 | UI polish: hero image, gold accents, mobile nav, rich text, image upload, alumni, timezone fix | ✅ Complete |
| 4.6 | Faculty CRUD + About page display, Buttondown newsletter, footer, CSV alumni import | ✅ Complete |
| 4.7 | Deployed to Vercel with custom domain | ✅ Complete |
| 5 | Student/faculty dashboard + admin lesson/jury scheduling | Pending |
