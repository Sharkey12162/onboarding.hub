-- ============================================================
--  ONBOARDING HUB — Supabase Schema
--  Run this in Supabase → SQL Editor
-- ============================================================

-- 1. Weekly Tasks
CREATE TABLE IF NOT EXISTS weekly_tasks (
  id         BIGSERIAL PRIMARY KEY,
  task       TEXT NOT NULL,
  owner      TEXT,
  due        DATE,
  status     TEXT DEFAULT 'Not started' CHECK (status IN ('Not started', 'In progress', 'Completed')),
  priority   TEXT DEFAULT 'Medium'     CHECK (priority IN ('Urgent', 'High', 'Medium', 'Low')),
  category   TEXT,
  resources  TEXT,
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Orientation Task Checkboxes
CREATE TABLE IF NOT EXISTS orientation_checks (
  id         TEXT PRIMARY KEY,
  checked    BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Responsibility Step Checkboxes
CREATE TABLE IF NOT EXISTS step_checks (
  id         TEXT PRIMARY KEY,
  checked    BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  Row Level Security (RLS) — enable for production
--  For shared team use (no auth), disable RLS or use anon policy
-- ============================================================

-- Option A: Open access (for internal team apps, simplest)
ALTER TABLE weekly_tasks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE orientation_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_checks        ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for anon" ON weekly_tasks
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for anon" ON orientation_checks
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for anon" ON step_checks
  FOR ALL USING (true) WITH CHECK (true);
