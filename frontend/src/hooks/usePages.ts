import { useEffect } from 'react';
import { usePageStore } from '@/stores/usePageStore';
import type { PageTreeItem } from '@/types';

/**
 * Hook to fetch all pages for the current user on app load.
 * Now delegates to the centralized PageStore which communicates with the backend.
 */
export function usePages() {
    const { fetchPages, pages, isLoading, error } = usePageStore();

    useEffect(() => {
        fetchPages();
    }, [fetchPages]);

    return { pages, isLoading, error };
}

/**
 * Hook to get lightweight page tree items for building the sidebar tree.
 */
export function usePageTree(): PageTreeItem[] {
    const { pages } = usePageStore();

    return pages.map((p) => ({
        id: p.id,
        parent_id: p.parent_id,
        title: p.title,
        emoji_icon: p.emoji_icon,
    }));
}
