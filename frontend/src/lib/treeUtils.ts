import type { PageTreeItem, PageTreeNode } from '@/types';

/**
 * Transforms a flat array of pages into a nested tree structure.
 * Pages with parent_id === null become root nodes.
 * This avoids recursive DB queries as recommended in the SPEC.
 */
export function buildPageTree(pages: PageTreeItem[]): PageTreeNode[] {
    const map = new Map<string, PageTreeNode>();
    const roots: PageTreeNode[] = [];

    // First pass: create tree nodes without children
    for (const page of pages) {
        map.set(page.id, { ...page, children: [] });
    }

    // Second pass: attach children to parents
    for (const page of pages) {
        const node = map.get(page.id)!;
        if (page.parent_id && map.has(page.parent_id)) {
            map.get(page.parent_id)!.children.push(node);
        } else {
            roots.push(node);
        }
    }

    return roots;
}

/**
 * Find all descendant IDs of a given page (including itself).
 * Used for cascade-delete confirmation UI.
 */
export function getDescendantIds(
    pages: PageTreeItem[],
    pageId: string
): string[] {
    const ids: string[] = [pageId];
    const children = pages.filter((p) => p.parent_id === pageId);
    for (const child of children) {
        ids.push(...getDescendantIds(pages, child.id));
    }
    return ids;
}

/**
 * Build a breadcrumb path for a given page.
 * Returns an array of { id, title } from root to the given page.
 */
export function getBreadcrumbPath(
    pages: PageTreeItem[],
    pageId: string
): { id: string; title: string }[] {
    const path: { id: string; title: string }[] = [];
    let current = pages.find((p) => p.id === pageId);

    while (current) {
        path.unshift({ id: current.id, title: current.title });
        current = current.parent_id
            ? pages.find((p) => p.id === current!.parent_id)
            : undefined;
    }

    return path;
}
