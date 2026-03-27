export interface Project {
    id: string;
    owner_id: string;
    name: string;
    emoji_icon: string | null;
    created_at: string;
    updated_at: string;
}

export interface Page {
    id: string;
    owner_id: string;
    project_id: string | null;
    parent_id: string | null;
    title: string;
    emoji_icon: string | null;
    thumbnail_url: string | null;
    content: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
}

/** Lightweight version used for the sidebar tree (no content) */
export interface PageTreeItem {
    id: string;
    project_id: string | null;
    parent_id: string | null;
    title: string;
    emoji_icon: string | null;
}

export interface PageTreeNode extends PageTreeItem {
    children: PageTreeNode[];
}
