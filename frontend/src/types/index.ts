export interface Page {
    id: string;
    owner_id: string;
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
    parent_id: string | null;
    title: string;
    emoji_icon: string | null;
}

/** Tree node with children for rendering the sidebar */
export interface PageTreeNode extends PageTreeItem {
    children: PageTreeNode[];
}
