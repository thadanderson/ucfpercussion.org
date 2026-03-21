-- UCF Percussion Studio — Database Schema
-- Paste and run once in the Supabase dashboard → SQL Editor.
-- Tables are created in dependency order (users first, then referencing tables).

-- ============================================================
-- 1. users
--    id is the auth.users UUID — admin inserts this after creating the
--    auth user via the Supabase dashboard (no gen_random_uuid() default).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id          uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text        NOT NULL,
  role        text        NOT NULL CHECK (role IN ('student', 'faculty', 'admin', 'alumni')),
  created_at  timestamptz NOT NULL DEFAULT now()
);
-- NOTE: If adding alumni to an existing database, run:
-- ALTER TABLE public.users DROP CONSTRAINT users_role_check;
-- ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('student', 'faculty', 'admin', 'alumni'));

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Admin: full access to all rows
CREATE POLICY "admin_all_users" ON public.users
  FOR ALL
  USING  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Authenticated: read own row only
CREATE POLICY "user_read_own" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- ============================================================
-- 2. students
-- ============================================================
CREATE TABLE IF NOT EXISTS public.students (
  id               uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid    NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  first_name       text    NOT NULL,
  last_name        text    NOT NULL,
  instrument       text,
  enrollment_year  integer,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS students_user_id_idx ON public.students(user_id);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_students" ON public.students
  FOR ALL
  USING  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Student: read own row (user_id matches auth uid)
CREATE POLICY "student_read_own" ON public.students
  FOR SELECT
  USING (user_id = auth.uid());

-- ============================================================
-- 3. faculty
-- ============================================================
CREATE TABLE IF NOT EXISTS public.faculty (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  first_name  text        NOT NULL,
  last_name   text        NOT NULL,
  title       text,
  bio         text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS faculty_user_id_idx ON public.faculty(user_id);

ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_faculty" ON public.faculty
  FOR ALL
  USING  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Authenticated: read all faculty rows
CREATE POLICY "auth_read_faculty" ON public.faculty
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================
-- 4. lessons
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lessons (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        uuid        NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  faculty_id        uuid        NOT NULL REFERENCES public.faculty(id)  ON DELETE CASCADE,
  scheduled_at      timestamptz NOT NULL,
  duration_minutes  integer     NOT NULL DEFAULT 60,
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lessons_student_id_idx   ON public.lessons(student_id);
CREATE INDEX IF NOT EXISTS lessons_faculty_id_idx   ON public.lessons(faculty_id);
CREATE INDEX IF NOT EXISTS lessons_scheduled_at_idx ON public.lessons(scheduled_at);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_lessons" ON public.lessons
  FOR ALL
  USING  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Student or faculty involved in the lesson can read it
CREATE POLICY "user_read_own_lessons" ON public.lessons
  FOR SELECT
  USING (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
    OR
    faculty_id IN (SELECT id FROM public.faculty  WHERE user_id = auth.uid())
  );

-- ============================================================
-- 5. juries
-- ============================================================
CREATE TABLE IF NOT EXISTS public.juries (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    uuid        NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  semester      text        NOT NULL,
  scheduled_at  timestamptz NOT NULL,
  grade         text,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS juries_student_id_idx   ON public.juries(student_id);
CREATE INDEX IF NOT EXISTS juries_scheduled_at_idx ON public.juries(scheduled_at);

ALTER TABLE public.juries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_juries" ON public.juries
  FOR ALL
  USING  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Student: read own jury rows
CREATE POLICY "student_read_own_juries" ON public.juries
  FOR SELECT
  USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

-- ============================================================
-- 6. events
-- ============================================================
CREATE TABLE IF NOT EXISTS public.events (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text        NOT NULL,
  description  text,
  location     text,
  starts_at    timestamptz NOT NULL,
  ends_at      timestamptz,
  image_url    text,
  published    boolean     NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);
-- NOTE: If adding image_url to an existing database, run:
-- ALTER TABLE public.events ADD COLUMN IF NOT EXISTS image_url text;

CREATE INDEX IF NOT EXISTS events_starts_at_idx ON public.events(starts_at);
CREATE INDEX IF NOT EXISTS events_published_idx ON public.events(published);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_events" ON public.events
  FOR ALL
  USING  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Authenticated: read all events (including unpublished)
CREATE POLICY "auth_read_all_events" ON public.events
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Anonymous: read published events only
CREATE POLICY "anon_read_published_events" ON public.events
  FOR SELECT
  USING (published = true);

-- ============================================================
-- 7. posts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.posts (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text        NOT NULL,
  slug          text        NOT NULL UNIQUE,
  content       text,
  published     boolean     NOT NULL DEFAULT false,
  published_at  timestamptz,
  author_id     uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS posts_slug_idx      ON public.posts(slug);
CREATE INDEX IF NOT EXISTS posts_published_idx ON public.posts(published);
CREATE INDEX IF NOT EXISTS posts_author_id_idx ON public.posts(author_id);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_posts" ON public.posts
  FOR ALL
  USING  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Authenticated: read all posts (including drafts)
CREATE POLICY "auth_read_all_posts" ON public.posts
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Anonymous: read published posts only
CREATE POLICY "anon_read_published_posts" ON public.posts
  FOR SELECT
  USING (published = true);

-- ============================================================
-- 8. alumni
-- ============================================================
CREATE TABLE IF NOT EXISTS public.alumni (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  first_name          text        NOT NULL,
  last_name           text        NOT NULL,
  graduation_year     integer,
  degree              text,
  "current_role"      text,
  current_institution text,
  grad_school         text,
  bio                 text,
  headshot_url        text,
  published           boolean     NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS alumni_user_id_idx   ON public.alumni(user_id);
CREATE INDEX IF NOT EXISTS alumni_published_idx ON public.alumni(published);

ALTER TABLE public.alumni ENABLE ROW LEVEL SECURITY;

-- Admin: full access
CREATE POLICY "admin_all_alumni" ON public.alumni
  FOR ALL
  USING  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Alumni: read their own row
CREATE POLICY "alumni_read_own" ON public.alumni
  FOR SELECT
  USING (user_id = auth.uid());

-- Alumni: update their own row
CREATE POLICY "alumni_update_own" ON public.alumni
  FOR UPDATE
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Anonymous/authenticated: read published rows
CREATE POLICY "anon_read_published_alumni" ON public.alumni
  FOR SELECT
  USING (published = true);

-- ============================================================
-- 9. music_library
-- ============================================================
CREATE TABLE IF NOT EXISTS public.music_library (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text        NOT NULL,
  composer         text,
  arranger         text,
  instrumentation  text,
  location         text,
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS music_library_title_idx ON public.music_library(title);

ALTER TABLE public.music_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_music_library" ON public.music_library
  FOR ALL
  USING  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Authenticated: read all entries
CREATE POLICY "auth_read_music_library" ON public.music_library
  FOR SELECT
  USING (auth.role() = 'authenticated');
