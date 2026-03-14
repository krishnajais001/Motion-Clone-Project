-- 1. Create the pages table
CREATE TABLE pages (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id     UUID REFERENCES pages(id) ON DELETE CASCADE,  -- NULL = root page
    title         TEXT NOT NULL DEFAULT 'Untitled',
    emoji_icon    TEXT,                   -- single emoji character, e.g. '📄'
    thumbnail_url TEXT,                   -- public URL from Supabase Storage
    content       JSONB,                  -- TipTap JSON document
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Add indexes for performance
CREATE INDEX pages_owner_id_idx ON pages(owner_id);
CREATE INDEX pages_parent_id_idx ON pages(parent_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- SELECT: Users can only read their own pages
CREATE POLICY "Users can read own pages"
ON pages FOR SELECT
USING (owner_id = auth.uid());

-- INSERT: Users can only create pages for themselves
CREATE POLICY "Users can insert own pages"
ON pages FOR INSERT
WITH CHECK (owner_id = auth.uid());

-- UPDATE: Users can only update their own pages
CREATE POLICY "Users can update own pages"
ON pages FOR UPDATE
USING (owner_id = auth.uid());

-- DELETE: Users can only delete their own pages
CREATE POLICY "Users can delete own pages"
ON pages FOR DELETE
USING (owner_id = auth.uid());

-- 5. Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pages_updated_at
BEFORE UPDATE ON pages
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
