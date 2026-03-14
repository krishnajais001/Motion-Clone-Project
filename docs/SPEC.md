# Product Specification — Notion/Motion Clone (MVP)

**Version:** 1.0  
**Status:** Draft  
**Stack:** React · Node.js + Express · Supabase · TipTap  

---

## Table of Contents

- [Product Specification — Notion/Motion Clone (MVP)](#product-specification--notionmotion-clone-mvp)
  - [Table of Contents](#table-of-contents)
  - [1. Project Overview](#1-project-overview)
  - [2. Tech Stack](#2-tech-stack)
  - [3. Database Schema](#3-database-schema)
    - [`pages` table](#pages-table)
    - [Indexes](#indexes)
    - [Auto-update `updated_at`](#auto-update-updated_at)
  - [4. Authentication](#4-authentication)
    - [Auth Pages](#auth-pages)
  - [5. Core Features](#5-core-features)
    - [5.1 Sidebar](#51-sidebar)
    - [5.2 Page Model](#52-page-model)
    - [5.3 Editor](#53-editor)
    - [5.4 Slash Menu](#54-slash-menu)
    - [5.5 Page Header (Title, Icon, Thumbnail)](#55-page-header-title-icon-thumbnail)
    - [5.6 Nested Pages](#56-nested-pages)
    - [5.7 Image Uploads](#57-image-uploads)
    - [5.8 Search](#58-search)
  - [6. API Endpoints](#6-api-endpoints)
    - [`POST /api/upload`](#post-apiupload)
    - [`GET /api/health`](#get-apihealth)
  - [7. Supabase Storage](#7-supabase-storage)
    - [Buckets](#buckets)
    - [Path conventions](#path-conventions)
  - [8. Row Level Security (RLS)](#8-row-level-security-rls)
  - [9. UI/UX Specification](#9-uiux-specification)
    - [Layout](#layout)
    - [Typography](#typography)
    - [Color Palette (Light Mode — default at MVP)](#color-palette-light-mode--default-at-mvp)
    - [Sidebar width](#sidebar-width)
    - [Empty States](#empty-states)
    - [Loading States](#loading-states)
  - [10. State Management](#10-state-management)
    - [`usePageStore`](#usepagestore)
    - [`useUIStore`](#useuistore)
  - [11. Project Structure](#11-project-structure)
  - [12. Build Order](#12-build-order)
  - [13. Out of Scope (MVP)](#13-out-of-scope-mvp)
  - [14. Dependencies](#14-dependencies)
    - [Frontend (`client/`)](#frontend-client)
    - [Backend (`server/`)](#backend-server)

---

## 1. Project Overview

A Notion-inspired personal knowledge base and document editor. Users can create, nest, and edit rich-text pages with a Notion-like UI — including a slash command menu, emoji icons, cover thumbnails, and inline images. All data is private per user.

**Primary User Goal:** Capture and organize personal notes and documents in a fast, keyboard-friendly editor with a clean hierarchical sidebar.

---

## 2. Tech Stack

| Layer         | Technology                   | Notes                                   |
| ------------- | ---------------------------- | --------------------------------------- |
| Frontend      | React 18 + Vite              | SPA, React Router v6                    |
| Styling       | Tailwind CSS + shadcn/ui     | Utility-first + headless components     |
| Editor        | TipTap 3                     | ProseMirror-based rich text             |
| State         | Zustand                      | Sidebar tree, active page, UI state     |
| Data Fetching | TanStack Query (React Query) | Caching, mutations, loading states      |
| Backend       | Node.js + Express            | Thin server; primarily for file uploads |
| Database      | Supabase (PostgreSQL)        | Auth + DB + Storage                     |
| Auth          | Supabase Auth                | Email/password, JWT sessions            |
| File Storage  | Supabase Storage             | Images and thumbnails                   |
| Search        | Fuse.js                      | Client-side fuzzy search on page titles |
| Emoji Picker  | emoji-mart                   | Page icon selection                     |

---

## 3. Database Schema

### `pages` table

```sql
create table pages (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users(id) on delete cascade,
  parent_id     uuid references pages(id) on delete cascade,  -- null = root page
  title         text not null default 'Untitled',
  emoji_icon    text,                   -- single emoji character, e.g. '📄'
  thumbnail_url text,                   -- public URL from Supabase Storage
  content       jsonb,                  -- TipTap JSON document
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
```

### Indexes

```sql
create index pages_owner_id_idx on pages(owner_id);
create index pages_parent_id_idx on pages(parent_id);
```

### Auto-update `updated_at`

```sql
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
before update on pages
for each row execute function update_updated_at();
```

---

## 4. Authentication

- **Provider:** Supabase Auth — email + password
- **Session management:** Supabase JS client handles JWT storage and refresh automatically
- **Protected routes:** All `/app/*` routes require an active session; unauthenticated users are redirected to `/login`
- **User data isolation:** Enforced at the database level via RLS (see §8)

### Auth Pages

| Route     | Purpose                                             |
| --------- | --------------------------------------------------- |
| `/login`  | Sign in form                                        |
| `/signup` | Sign up form                                        |
| `/`       | Redirects to `/app` if authenticated, else `/login` |

---

## 5. Core Features

### 5.1 Sidebar

The sidebar is the primary navigation shell. It is always visible on desktop.

**Layout (top to bottom):**

```
┌─────────────────────────────┐
│  [Avatar]  Workspace Name ▾ │  ← click → settings modal
├─────────────────────────────┤
│  🔍  Search          ⌘K     │
│  🏠  Home                   │
├─────────────────────────────┤
│  PAGES                      │
│  ▶ 📄 Getting Started       │
│  ▼ 📁 Projects              │
│      ▶ 📄 Project Alpha      │
│      ▶ 📄 Project Beta       │
│  ▶ 📄 Ideas                 │
├─────────────────────────────┤
│  + New Page                 │
│  ⚙️  Settings               │
└─────────────────────────────┘
```

**Behaviors:**

- Each page row shows: expand/collapse toggle (if it has children), emoji icon, and truncated title
- Hovering a page row reveals: `+` (add child page) and `···` (context menu)
- Context menu actions: Rename, Duplicate, Delete, Copy link
- Clicking a page navigates to `/app/page/:id`
- Active page is highlighted
- Sidebar can be collapsed (toggle button on left edge)
- Sidebar width is fixed at `240px`

**Page tree loading strategy:**

Fetch all pages for the current user on app load (`SELECT id, title, emoji_icon, parent_id FROM pages WHERE owner_id = $1`). Build the tree client-side using a flat → tree transform. This avoids recursive DB queries at MVP scale.

---

### 5.2 Page Model

Each page is a document with the following user-visible properties:

| Property   | Type           | Description                                                     |
| ---------- | -------------- | --------------------------------------------------------------- |
| Title      | string         | Displayed as a large H1 at the top of the page. Editable inline |
| Emoji Icon | string (emoji) | Shown in sidebar and page header. Optional                      |
| Thumbnail  | image URL      | Full-width banner image at the top. Optional                    |
| Content    | TipTap JSON    | The body of the page                                            |
| Parent     | page ID        | Determines nesting in the tree                                  |

**Page route:** `/app/page/:id`

**Creating a new page:**
- Click "+ New Page" in the sidebar → creates a root-level page with title "Untitled"
- Click `+` next to a page in the sidebar → creates a child page under that parent
- Redirects to the new page immediately after creation

**Deleting a page:**
- Deletes the page and all its descendants (cascading via DB foreign key)
- Shows a confirmation dialog before deletion

---

### 5.3 Editor

Built with **TipTap 3**. The editor renders below the page header.

**Extensions:**

| Extension            | Package                          | Purpose                                                                                                     |
| -------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| StarterKit           | `@tiptap/starter-kit`            | Bold, italic, strike, code, blockquote, HR, heading (H1–H3), bullet list, ordered list, hard break, history |
| Table                | `@tiptap/extension-table`        | Table insertion and editing                                                                                 |
| TableRow             | `@tiptap/extension-table-row`    | —                                                                                                           |
| TableHeader          | `@tiptap/extension-table-header` | —                                                                                                           |
| TableCell            | `@tiptap/extension-table-cell`   | —                                                                                                           |
| Image                | `@tiptap/extension-image`        | Inline images from Supabase                                                                                 |
| Placeholder          | `@tiptap/extension-placeholder`  | "Type '/' for commands…"                                                                                    |
| Custom: SlashCommand | (custom)                         | `/` menu (see §5.4)                                                                                         |

**Auto-save:** Content is saved to Supabase on a **1-second debounce** after each change. A subtle "Saving…" / "Saved" indicator is shown in the top bar.

**Content format:** Stored as TipTap's JSON representation in the `content` (jsonb) column.

---

### 5.4 Slash Menu

Triggered when the user types `/` at the start of a line or after a space.

**Menu items:**

| Label         | Icon | Action                                            |
| ------------- | ---- | ------------------------------------------------- |
| Text          | Aa   | Convert to paragraph                              |
| Heading 1     | H1   | Convert to H1                                     |
| Heading 2     | H2   | Convert to H2                                     |
| Heading 3     | H3   | Convert to H3                                     |
| Bullet List   | •    | Toggle bullet list                                |
| Numbered List | 1.   | Toggle ordered list                               |
| Table         | ⊞    | Insert 3×3 table                                  |
| Image         | 🖼    | Open image upload dialog                          |
| Divider       | —    | Insert horizontal rule                            |
| Sub-page      | ↗    | Create new child page and insert a page link node |

**UX behaviors:**

- Menu appears as a floating dropdown anchored below the cursor
- Typing after `/` filters the list in real-time (fuzzy match on label)
- Arrow keys to navigate, `Enter` to select, `Escape` to dismiss
- Clicking outside dismisses the menu

---

### 5.5 Page Header (Title, Icon, Thumbnail)

The header sits above the editor content area.

**Thumbnail (cover image):**

- Displayed as a full-width banner (~200px tall) at the very top of the page
- "Add cover" button appears on hover when no thumbnail is set
- Clicking it opens a file picker → upload to Supabase Storage → save URL
- "Remove cover" and "Reposition" (drag vertically) available on hover when set

**Emoji Icon:**

- Displayed as a large emoji (~48px) overlapping the bottom of the thumbnail (or at the top-left of the title area if no thumbnail)
- Clicking it opens the emoji-mart picker
- "Remove icon" option available in the picker
- Defaults to no icon

**Title:**

- A plain `contenteditable` div styled as a large H1 (not part of TipTap editor)
- Placeholder text: "Untitled"
- `Enter` key moves focus into the editor body
- Title synced to the sidebar in real-time via Zustand

---

### 5.6 Nested Pages

- A page can have any number of child pages via `parent_id`
- Nesting depth is unlimited (no artificial cap at MVP)
- In the sidebar, nested pages appear as an indented collapsible tree
- A page link node can be inserted in editor content via the slash menu's "Sub-page" command — this renders as a clickable card block (page title + icon) inside the document

**Sub-page block in editor:**

Rendered as a styled `NodeView` component. Clicking it navigates to that page. The title shown in the block reflects the linked page's current title (resolved at render time from the Zustand page tree).

---

### 5.7 Image Uploads

**Flow:**

1. User selects image via slash menu → Image command, or drag-and-drop into editor
2. Frontend POSTs the file to `POST /api/upload` (Express endpoint)
3. Express receives the file (via Multer), uploads to Supabase Storage bucket `content-images`
4. Returns `{ url: "https://..." }` to frontend
5. TipTap inserts an Image node with the returned URL

**Constraints:**

- Accepted types: `image/png`, `image/jpeg`, `image/webp`, `image/gif`
- Max file size: 5MB (enforced on both client and server)
- Images are stored under path: `content-images/{owner_id}/{timestamp}-{filename}`

**Thumbnail uploads** follow the same flow but use a separate path prefix: `thumbnails/{owner_id}/{page_id}`.

---

### 5.8 Search

**Implementation:** Client-side fuzzy search using **Fuse.js** over page titles.

**Search index:** Built from the flat page list already loaded in Zustand on app start. Re-indexed whenever the page list changes.

**Fuse.js config:**

```js
{
  keys: ['title'],
  threshold: 0.4,
  includeScore: true
}
```

**UI — Command Palette Modal:**

- Triggered by `⌘K` (Mac) / `Ctrl+K` (Windows) or clicking the Search item in the sidebar
- Full-screen overlay with centered modal
- Text input autofocused on open
- Results shown as a list of matching pages (icon + title + breadcrumb path)
- Clicking a result navigates to `/app/page/:id` and closes the modal
- `Escape` closes the modal
- Arrow keys to navigate results, `Enter` to open

---

## 6. API Endpoints

The Express backend is intentionally thin. Most data operations happen via the Supabase JS client directly from the frontend.

### `POST /api/upload`

Upload an image to Supabase Storage.

**Request:** `multipart/form-data`

| Field    | Type   | Description                                     |
| -------- | ------ | ----------------------------------------------- |
| `file`   | File   | Image file                                      |
| `type`   | string | `"content"` or `"thumbnail"`                    |
| `pageId` | string | Page UUID (used in storage path for thumbnails) |

**Response:**

```json
{ "url": "https://<project>.supabase.co/storage/v1/object/public/..." }
```

**Errors:**

| Code | Reason                         |
| ---- | ------------------------------ |
| 400  | Missing file or invalid type   |
| 413  | File exceeds 5MB               |
| 415  | Unsupported MIME type          |
| 500  | Supabase Storage upload failed |

### `GET /api/health`

Returns `200 OK`. Used for uptime checks.

---

## 7. Supabase Storage

### Buckets

| Bucket           | Public | Purpose                         |
| ---------------- | ------ | ------------------------------- |
| `content-images` | Yes    | Images embedded in page content |
| `thumbnails`     | Yes    | Page cover/thumbnail images     |

### Path conventions

```
content-images/{owner_id}/{unix_timestamp}-{sanitized_filename}
thumbnails/{owner_id}/{page_id}
```

Thumbnails use the `page_id` as filename so re-uploading a cover naturally overwrites the old one.

---

## 8. Row Level Security (RLS)

RLS is enabled on the `pages` table. All policies use `auth.uid()`.

```sql
-- Enable RLS
alter table pages enable row level security;

-- SELECT: users can only read their own pages
create policy "Users can read own pages"
on pages for select
using (owner_id = auth.uid());

-- INSERT: users can only create pages for themselves
create policy "Users can insert own pages"
on pages for insert
with check (owner_id = auth.uid());

-- UPDATE: users can only update their own pages
create policy "Users can update own pages"
on pages for update
using (owner_id = auth.uid());

-- DELETE: users can only delete their own pages
create policy "Users can delete own pages"
on pages for delete
using (owner_id = auth.uid());
```

---

## 9. UI/UX Specification

### Layout

```
┌──────────────────────────────────────────────────────┐
│  [Sidebar 240px]  │  [Page Area — flex-1]            │
│                   │  ┌──────────────────────────────┐ │
│  [nav tree]       │  │ Thumbnail (optional banner)  │ │
│                   │  │ [Emoji] Title                │ │
│                   │  │ ──────────────────────────── │ │
│                   │  │ Editor content               │ │
│                   │  │                              │ │
└──────────────────────────────────────────────────────┘
```

### Typography

- Page title: `font-size: 2.5rem`, `font-weight: 700`, `line-height: 1.2`
- Editor body: `font-size: 1rem`, `line-height: 1.75`
- Sidebar page labels: `font-size: 0.875rem`

### Color Palette (Light Mode — default at MVP)

| Token              | Value     | Usage                     |
| ------------------ | --------- | ------------------------- |
| `--bg-primary`     | `#FFFFFF` | Page background           |
| `--bg-secondary`   | `#F7F7F5` | Sidebar background        |
| `--bg-hover`       | `#EFEFED` | Hover states              |
| `--text-primary`   | `#37352F` | Body text                 |
| `--text-secondary` | `#787774` | Placeholder, muted labels |
| `--text-accent`    | `#2383E2` | Links, active states      |
| `--border`         | `#E9E9E7` | Dividers, borders         |

### Sidebar width

- Expanded: `240px`
- Collapsed: `0px` (hidden, toggled with a left-edge button)
- Collapsing is animated with a CSS transition (`250ms ease`)

### Empty States

- No pages yet: show centered illustration + "Create your first page" button
- Empty page body: TipTap placeholder text "Type '/' for commands…"
- No search results: "No pages found for '{query}'"

### Loading States

- Initial app load: skeleton placeholders for the sidebar tree
- Page load: skeleton for title area + editor
- Saving: subtle "Saving…" indicator in top-right (disappears after "Saved ✓" for 2s)

---

## 10. State Management

Zustand stores:

### `usePageStore`

```ts
{
  pages: Page[],             // flat array of all user pages
  activePage: Page | null,   // currently open page
  setPages: (pages) => void,
  setActivePage: (page) => void,
  updatePage: (id, patch) => void,
  addPage: (page) => void,
  removePage: (id) => void,
}
```

### `useUIStore`

```ts
{
  sidebarOpen: boolean,
  searchOpen: boolean,
  toggleSidebar: () => void,
  openSearch: () => void,
  closeSearch: () => void,
}
```

---

## 11. Project Structure

```
/
├── client/                   # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── sidebar/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── PageTreeItem.tsx
│   │   │   │   └── PageContextMenu.tsx
│   │   │   ├── editor/
│   │   │   │   ├── Editor.tsx
│   │   │   │   ├── SlashMenu.tsx
│   │   │   │   ├── SubPageBlock.tsx
│   │   │   │   └── extensions/
│   │   │   ├── page/
│   │   │   │   ├── PageHeader.tsx
│   │   │   │   ├── ThumbnailBanner.tsx
│   │   │   │   └── EmojiPicker.tsx
│   │   │   └── search/
│   │   │       └── SearchModal.tsx
│   │   ├── stores/
│   │   │   ├── usePageStore.ts
│   │   │   └── useUIStore.ts
│   │   ├── hooks/
│   │   │   ├── usePages.ts
│   │   │   └── usePageTree.ts
│   │   ├── lib/
│   │   │   ├── supabase.ts    # Supabase client init
│   │   │   └── treeUtils.ts   # flat → tree transform
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   └── AppPage.tsx
│   │   └── App.tsx
│   └── index.html
│
├── server/                   # Express backend
│   ├── src/
│   │   ├── routes/
│   │   │   └── upload.ts
│   │   ├── middleware/
│   │   │   └── auth.ts        # Verify Supabase JWT
│   │   └── index.ts
│   └── package.json
│
└── README.md
```

---

## 12. Build Order

Implement in this sequence to ensure each layer is testable before building on top:

1. **Auth** — Supabase project setup, email/password sign-up/login, protected routes
2. **Database** — Create `pages` table, indexes, RLS policies, `updated_at` trigger
3. **Sidebar (static)** — Layout shell, hardcoded tree, collapse toggle
4. **Page CRUD** — Create/read/update/delete pages wired to Supabase; sidebar goes live
5. **Editor** — TipTap with StarterKit; auto-save to `content` column
6. **Page Header** — Title editing, emoji picker, thumbnail upload
7. **Slash Menu** — Custom TipTap extension with all menu items
8. **Nested Pages** — Parent/child logic, sub-page slash command, tree expand/collapse
9. **Image Uploads** — Express upload endpoint, Supabase Storage, TipTap Image node
10. **Tables** — TipTap Table extension + basic toolbar
11. **Search** — ⌘K modal, Fuse.js index, keyboard navigation
12. **Polish** — Empty states, loading skeletons, error boundaries, saving indicator

---

## 13. Out of Scope (MVP)

The following features are explicitly deferred to post-MVP:

- Real-time collaborative editing (Yjs / HocusPocus)
- Page sharing and permissions
- Comments and mentions
- Page version history
- Drag-and-drop page reordering in the sidebar
- Inline databases / kanban / calendar views
- Dark mode
- Mobile-responsive layout
- AI writing assistant
- Export (PDF / Markdown)
- Templates

---

## 14. Dependencies

### Frontend (`client/`)

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2",
    "@tiptap/react": "^3",
    "@tiptap/starter-kit": "^3",
    "@tiptap/extension-table": "^3",
    "@tiptap/extension-table-row": "^3",
    "@tiptap/extension-table-header": "^3",
    "@tiptap/extension-table-cell": "^3",
    "@tiptap/extension-image": "^3",
    "@tiptap/extension-placeholder": "^3",
    "@tanstack/react-query": "^5",
    "emoji-mart": "^5",
    "fuse.js": "^7",
    "react-router-dom": "^6",
    "zustand": "^4"
  }
}
```

### Backend (`server/`)

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2",
    "express": "^4",
    "multer": "^1",
    "cors": "^2",
    "dotenv": "^16"
  }
}
```

---

*Last updated: March 2026*