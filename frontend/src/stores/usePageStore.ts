import { create } from 'zustand';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import type { Page } from '@/types';

interface PageStore {
    /** Flat array of all user pages */
    pages: Page[];
    /** ID of the currently open/active page */
    activePageId: string | null;
    /** Loading state */
    isLoading: boolean;
    /** Error message */
    error: string | null;

    // Actions
    fetchPages: () => Promise<void>;
    setPages: (pages: Page[]) => void;
    setActivePageId: (id: string | null) => void;
    addPage: (parentId?: string | null) => Promise<Page | null>;
    updatePage: (id: string, patch: Partial<Page>) => Promise<void>;
    removePage: (id: string) => Promise<void>;
}

/**
 * Store for managing page data, synced with the backend.
 */
export const usePageStore = create<PageStore>((set, get) => ({
    pages: [],
    activePageId: null,
    isLoading: false,
    error: null,

    fetchPages: async () => {
        set({ isLoading: true, error: null });
        try {
            const pages = await apiGet<Page[]>('/api/pages');
            set({ pages, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    setPages: (pages) => set({ pages }),

    setActivePageId: (id) => set({ activePageId: id }),

    addPage: async (parentId = null) => {
        set({ isLoading: true });
        try {
            const newPage = await apiPost<Page>('/api/pages', {
                title: 'Untitled',
                parent_id: parentId,
            });
            set((state) => ({
                pages: [...state.pages, newPage],
                isLoading: false,
            }));
            return newPage;
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
            return null;
        }
    },

    updatePage: async (id, patch) => {
        // Optimistic update
        const previousPages = get().pages;
        set((state) => ({
            pages: state.pages.map((p) =>
                p.id === id ? { ...p, ...patch, updated_at: new Date().toISOString() } : p
            ),
        }));

        try {
            await apiPut(`/api/pages/${id}`, patch);
        } catch (err: any) {
            // Rollback on error
            set({ pages: previousPages, error: err.message });
        }
    },

    removePage: async (id) => {
        const previousPages = get().pages;
        set((state) => ({
            pages: state.pages.filter((p) => p.id !== id),
            activePageId: state.activePageId === id ? null : state.activePageId,
        }));

        try {
            await apiDelete(`/api/pages/${id}`);
        } catch (err: any) {
            set({ pages: previousPages, error: err.message });
        }
    },
}));
