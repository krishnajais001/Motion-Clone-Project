import { create } from 'zustand';
import type { Page, Project } from '@/types';

interface PageStore {
    /** 
     * ID of the currently selected project (if any).
     * This is UI state only.
     */
    activeProjectId: string | null;
    /** 
     * ID of the currently open/active page.
     * This is UI state only.
     */
    activePageId: string | null;

    // UI Actions
    setActiveProjectId: (id: string | null) => void;
    setActivePageId: (id: string | null) => void;
}

/**
 * Store for managing UI-specific navigation states.
 * Data fetching and caching (Pages/Projects) are handled by TanStack React Query.
 */
export const usePageStore = create<PageStore>((set) => ({
    activeProjectId: null,
    activePageId: null,

    setActiveProjectId: (id) => set({ activeProjectId: id }),
    setActivePageId: (id) => set({ activePageId: id }),
}));
