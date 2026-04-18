# UCF Percussion Studio — Project Guide

## Project Overview

A web application for the UCF Percussion Studio (University of Central Florida). It serves three audiences:

- **Public visitors** — event listings, faculty bios, alumni directory, audition info, about/contact pages
- **Students & faculty** — authenticated dashboard for studio tools, wiki, and music library
- **Admins** — full CRUD for events, faculty, alumni, and the Percussion Music Library (PML); assessment tools; read-only student roster

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router, Turbopack) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 (`@theme` in `globals.css` — no `tailwind.config.ts`) |
| Backend | Supabase (Postgres + Auth + RLS) |
| Auth client | `@supabase/ssr` 0.8.0 |
| React | 19.2.3 |
| Markdown | `gray-matter` (frontmatter) + `marked` (HTML rendering) |

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
content/
└── wiki/                      # Markdown wiki pages (edited in Obsidian)
    ├── current-semester/
    ├── studio-policies/
    ├── percussion-curriculum/
    ├── degree-recitals/
    └── resources/

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
│   │   ├── content/           # Coming soon placeholder
│   │   └── assessments/
│   │       ├── page.tsx       # Hub landing page — tool cards (PPAR, Ensemble Audition coming soon)
│   │       └── rubric/        # Percussion Performance Assessment Rubric (PPAR)
│   │           ├── page.tsx           # Assessment list
│   │           ├── actions.ts         # saveScores, deleteAssessment server actions
│   │           ├── new/page.tsx       # Create new assessment
│   │           ├── export/route.ts    # GET → anonymous CSV export
│   │           └── [id]/
│   │               ├── page.tsx       # Results / PAR summary view
│   │               └── score/page.tsx # Faculty score entry page
│   ├── auth/callback/         # OAuth code exchange route
│   └── dashboard/             # Authenticated user dashboard
│       ├── page.tsx           # Studio Dashboard — tool cards + admin link for admins
│       ├── profile/           # Alumni self-manage current_role, bio, etc.
│       ├── schedule/
│       ├── library/
│       ├── juries/
│       ├── barrier-review/    # Barrier Review & Drawing tool
│       ├── flash-phrases/     # Flash Phrases coordination training tool
│       └── wiki/
│           ├── layout.tsx     # WikiSidebar + content shell
│           └── [[...slug]]/   # Catch-all: renders any content/wiki/**/*.md page
│               └── page.tsx
├── components/
│   ├── admin/
│   │   ├── AdminNav.tsx       # "use client" — usePathname active-link sidebar
│   │   ├── DeleteButton.tsx   # "use client" — window.confirm before submit
│   │   ├── ImageUpload.tsx    # "use client" — Supabase Storage upload, returns public URL
│   │   ├── RichTextEditor.tsx # "use client" — Tiptap editor (bold, italic, lists, links)
│   │   └── assessments/
│   │       ├── ScoreForm.tsx            # "use client" — faculty/exam tabs, sliders, copy-from feature
│   │       └── DeleteAssessmentButton.tsx # "use client" — useTransition + confirm dialog
│   ├── auth/
│   │   └── LogoutButton.tsx   # "use client" — wraps signOut server action
│   ├── layout/
│   │   ├── Navbar.tsx         # async server component — passes isLoggedIn to NavMenu
│   │   ├── NavMenu.tsx        # "use client" — hamburger toggle, desktop + mobile nav
│   │   └── Footer.tsx
│   ├── tools/
│   │   └── barrier-review/    # Barrier Review & Drawing tool components
│   │       ├── BarrierReviewApp.tsx   # Main app shell, mode switching
│   │       ├── DrawSelector.tsx       # Slot-machine roulette wheel with Drawing Mode overlay
│   │       ├── LandingPage.tsx        # Mode selection (Barrier Review / Drawing)
│   │       ├── SideMenu.tsx           # Level/item configuration panel
│   │       ├── FilterMenu.tsx         # Filter controls
│   │       ├── ProfessorComment.tsx   # AI etude advice panel
│   │       ├── soundService.ts        # Tick/click sound effects
│   │       ├── constants.ts           # All levels of study and their items
│   │       └── types.ts               # RouletteItem and related types
│   ├── wiki/
│   │   └── WikiSidebar.tsx    # "use client" — collapsible sidebar, section headers + page links
│   └── ui/
│       ├── EventCard.tsx      # Typed from events Row; renders HTML descriptions + poster image
│       ├── FacultyCard.tsx    # "use client" — expandable bio, paragraph rendering
│       ├── NewsletterSubscribe.tsx  # "use client" — Buttondown subscribe form
│       └── PostCard.tsx       # Typed from posts Row
├── lib/
│   ├── assessment.ts          # Shared PPAR constants, score types, PAR/grade computation
│   ├── wiki.ts                # Reads content/wiki/ filesystem, builds nav tree, renders markdown
│   └── supabase/
│       ├── client.ts          # createBrowserClient<Database>
│       └── server.ts          # async createServerClient<Database> (awaits cookies())
├── proxy.ts                   # Session-refresh proxy — NOT middleware.ts
└── types/
    └── database.ts            # Hand-written DB types (replace with supabase gen types later)
```

## Database Schema (11 tables)

All tables live in `supabase/schema.sql`. Assessment tables are in `supabase/assessments_migration.sql`.

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
| `assessments` | PPAR assessment records | `semester`, `student_name`, `performance_level`, `degree_program`, `notes` |
| `assessment_scores` | Per-faculty scores for each assessment | `assessment_id` (FK, CASCADE), `faculty` (anderson/gay/moore), `exam_type` (barrier/jury), 15 numeric score columns, UNIQUE(assessment_id, faculty, exam_type) |

### RLS pattern

- Admins: full access via `(auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'`
- Authenticated users: read own records (students/faculty) or read all (events, posts, library)
- Anonymous: published events and posts only

### users.id note

`users.id` has no `gen_random_uuid()` default — the admin must insert the UUID that Supabase Auth assigns when creating the user.

### Supabase nested select limitation

Supabase TypeScript client cannot infer joins (e.g. `select("*, assessment_scores(*)")`) without `Relationships` entries in `database.ts`. When `Relationships: []` is used (required — see below), query both tables separately and join in JavaScript:

```typescript
const { data: assessments } = await supabase.from("assessments").select("*");
const { data: scores } = await supabase.from("assessment_scores").select("*");
// Join manually: scores.filter(s => s.assessment_id === a.id)
```

## Authentication

- Sign-in: email + password via `supabase.auth.signInWithPassword()`
- Roles stored in `app_metadata.role` (set in Supabase dashboard) — available server-side
- `proxy.ts` guards `/dashboard/*` (any authenticated) and `/admin/*` (role = 'admin')
- `redirect()` throws internally — **never wrap in try/catch**
- `cookies()` returns a Promise in Next.js 15+ — server client factory is `async`

### Checking role in server components

```typescript
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
const isAdmin = user?.app_metadata?.role === "admin";
```

Used in `dashboard/page.tsx` to conditionally render the Admin Dashboard link.

## Key Conventions

### Server actions pattern
```typescript
"use server";
// Parse FormData → call createClient() → call Supabase
// On error: redirect("/path?error=" + encodeURIComponent(error.message))
// On success: redirect("/path")
// redirect() is NEVER inside a try/catch
```

### Calling server actions from client components
Use `useTransition` — never call async server actions directly in event handlers:
```typescript
const [isPending, startTransition] = useTransition();
function handleClick() {
  startTransition(() => myServerAction(id));
}
```
Never add `onClick` to a server component — extract a `"use client"` wrapper component.

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

### Event detail pages
Each event has its own page at `/events/[id]`. `EventCard` is a compact horizontal row (date block, title/time/location, thumbnail) that links to the detail page. The `past` route (`/events/past`) takes precedence over `[id]` in Next.js App Router routing.

### Pinned events
Events have a `pinned boolean DEFAULT false` column. The homepage shows pinned upcoming events when any exist; falls back to the next 3 upcoming if none are pinned. Admins toggle pinning via a 📌 button in the admin events table (`toggleEventPinned` action in `admin/events/actions.ts`).

### Dark mode / color scheme
The site is locked to dark mode. `globals.css` sets `color-scheme: dark` on `:root` so the browser never flips to a light theme regardless of the visitor's system preference. All page backgrounds and text colors are set explicitly via UCF brand utilities (`bg-ucf-black`, `text-ucf-white`, etc.).

**Exception:** Admin pages and the Studio Wiki use a light (`bg-white` / `bg-gray-50`) content area inside the dark sidebar layout. The `.wiki-body` CSS class in `globals.css` applies dark text and blue links for wiki content rendered on a light background.

## Studio Wiki

- **Content location:** `content/wiki/` at the project root (not inside `src/`) — edited in Obsidian
- **Structure:** Top-level directories = sections; `.md` files inside = pages. Frontmatter fields: `title`, `order` (integer, controls sort order within section)
- **Library:** `src/lib/wiki.ts` reads the filesystem with `fs.readdirSync` + `process.cwd()`, parses frontmatter with `gray-matter`, renders markdown to HTML with `marked`
- **Route:** `src/app/dashboard/wiki/[[...slug]]/page.tsx` — catch-all handles any depth
- **Sidebar:** `src/components/wiki/WikiSidebar.tsx` — "use client", collapsible (open: `w-80`, closed: `w-12` icon-only strip), section headers are non-clickable labels, pages are indented links
- **Sections (in order):** Current Semester, Studio Policies, Percussion Curriculum, Degree Recitals, Resources

## Barrier Review & Drawing Tool

- **Route:** `/dashboard/barrier-review`
- **Components:** `src/components/tools/barrier-review/`
- **Modes:** Barrier Review (study reference) and Drawing (random item selector)
- **Drawing Mode overlay:** While spinning, a `backdrop-filter: blur(12px) brightness(0.45)` overlay lets motion bleed through without revealing text. A pulsing gold ring + "Drawing…" label float over it. Once the spin stops, a solid sealed overlay with a lock icon appears until the instructor clicks Reveal.
- **Levels of study defined in `constants.ts`:** Snare (Rudimental 1–3, Concert 1–3), Marimba (1–3), Timpani (Deficient, 1–2), Vibe (1–2), Keyboard (1–3), Multi-Perc (1–2), Drum Set (1–3)
- **AI etude advice:** `/api/etude-advice` route handler; uses `ProfessorComment` component

## Percussion Performance Assessment Rubric (PPAR)

- **Admin route:** `/admin/assessments/rubric/`
- **Hub:** `/admin/assessments/` — landing page with tool cards; add future tools (e.g. Ensemble Audition) here
- **Shared constants/utils:** `src/lib/assessment.ts` — `FACULTY`, `EXAM_TYPES`, `CRITERIA` (15 scored items across technique/performance/musicianship sections), `computePAR()`, `computeLetterGrade()`
- **Scoring:** Three faculty (Anderson, Gay, Moore) each score independently (asynchronously) on two exam types (Technical Barrier, Performance Jury). Scores are upserted on `(assessment_id, faculty, exam_type)` so re-saves are safe.
- **Score inputs:** Sliders (`type="range"`, step 0.1, `accentColor: "#FFC904"`) paired with a number readout. Range: 0–10 per criterion; section total /50; grand total /150.
- **Copy-from feature:** When a faculty member is absent, their scores can be copied from another faculty member who has already submitted for the same exam type. An amber banner appears automatically in `ScoreForm.tsx` with per-faculty copy buttons. Scores load into the form but are not saved until the user clicks Save.
- **PAR computation:** Purely derived at render time from jury section totals — not stored. `computePAR(sectionTotal)` returns 0 (Does Not Meet, <37.5), 1 (Meets, 37.5–44.9), or 2 (Exceeds, ≥45).
- **CSV export:** `GET /admin/assessments/rubric/export?faculty=anderson&semester=Spring+2026` — anonymous (no student name), filterable by faculty and semester. `faculty=average` exports averaged scores across all three faculty.
- **Score columns (15):** `s_technique`, `s_hand_limb_position`, `s_posture`, `s_physical_motion`, `s_rolling_sustain`, `p_tone_intonation`, `p_touch`, `p_sense_of_pulse`, `p_rhythmic_pitch_accuracy`, `p_overall_sound_concept`, `m_expression`, `m_interpretation`, `m_creativity`, `m_communication`, `m_reading`

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

Build must pass with **zero TypeScript errors**. Current route count: ~40 routes.

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
| 4.8 | Audition page content update, dark mode locked site-wide | ✅ Complete |
| 4.9 | Event detail pages, compact horizontal event cards, pinned events on homepage | ✅ Complete |
| 4.10 | Studio Wiki: filesystem markdown, collapsible sidebar, Notion-style layout | ✅ Complete |
| 4.11 | Barrier Review & Drawing tool: slot-machine wheel, Drawing Mode sealed/hazy overlay, AI etude advice | ✅ Complete |
| 4.12 | Flash Phrases coordination training tool | ✅ Complete |
| 4.13 | Percussion Performance Assessment Rubric (PPAR): async faculty scoring, sliders, PAR/grade, CSV export, copy-from feature, assessments hub | ✅ Complete |
| 5 | Student/faculty dashboard + admin lesson/jury scheduling | Pending |
