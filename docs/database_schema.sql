-- 1. PAGES TABLE (Existing)
CREATE TABLE IF NOT EXISTS pages (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id     UUID REFERENCES pages(id) ON DELETE CASCADE,
    title         TEXT NOT NULL DEFAULT 'Untitled',
    emoji_icon    TEXT,
    thumbnail_url TEXT,
    content       JSONB,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. TASKS TABLE (Enhanced)
CREATE TABLE IF NOT EXISTS tasks (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    page_id       UUID REFERENCES pages(id) ON DELETE SET NULL, -- Link to a page
    parent_id     UUID REFERENCES tasks(id) ON DELETE CASCADE,  -- Support nested tasks
    title         TEXT NOT NULL,
    description   TEXT,
    status        TEXT DEFAULT 'todo', -- todo, in-progress, done, blocked
    priority      TEXT DEFAULT 'none', -- none, low, medium, high, urgent
    due_date      TIMESTAMPTZ,
    order_index   INTEGER DEFAULT 0,    -- For drag-and-drop ordering
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. EVENTS TABLE (Calendar)
CREATE TABLE IF NOT EXISTS events (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    page_id       UUID REFERENCES pages(id) ON DELETE SET NULL,
    title         TEXT NOT NULL,
    description   TEXT,
    start_time    TIMESTAMPTZ NOT NULL,
    end_time      TIMESTAMPTZ NOT NULL,
    all_day       BOOLEAN DEFAULT false,
    color         TEXT DEFAULT '#2383E2',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS tasks_owner_id_idx ON tasks(owner_id);
CREATE INDEX IF NOT EXISTS tasks_page_id_idx ON tasks(page_id);
CREATE INDEX IF NOT EXISTS events_owner_id_idx ON events(owner_id);
CREATE INDEX IF NOT EXISTS events_start_time_idx ON events(start_time);

-- 5. ENABLE RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 6. POLICIES (Tasks)
DO $$ BEGIN
    CREATE POLICY "Users can read own tasks" ON tasks FOR SELECT USING (owner_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert own tasks" ON tasks FOR INSERT WITH CHECK (owner_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (owner_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (owner_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 7. POLICIES (Events)
DO $$ BEGIN
    CREATE POLICY "Users can read own events" ON events FOR SELECT USING (owner_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert own events" ON events FOR INSERT WITH CHECK (owner_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own events" ON events FOR UPDATE USING (owner_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can delete own events" ON events FOR DELETE USING (owner_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 8. TRIGGERS (Auto-update updated_at)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE OR REPLACE TRIGGER update_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
