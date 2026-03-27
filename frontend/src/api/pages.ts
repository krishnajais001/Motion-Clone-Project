import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import type { Page } from '@/types';

export const pagesAPI = {
    /** Fetch all user pages */
    getAll: async () => {
        return apiGet<Page[]>('/api/pages');
    },

    /** Get a single page by ID */
    getById: async (id: string) => {
        return apiGet<Page>(`/api/pages/${id}`);
    },

    /** Create a new page */
    create: async (data: { title: string; parent_id?: string | null; project_id?: string | null }) => {
        return apiPost<Page>('/api/pages', data);
    },

    /** Update an existing page */
    update: async (id: string, patch: Partial<Page>) => {
        return apiPut<Page>(`/api/pages/${id}`, patch);
    },

    /** Delete a page */
    delete: async (id: string) => {
        return apiDelete(`/api/pages/${id}`);
    }
};
