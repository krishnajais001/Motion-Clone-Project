import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import type { Project } from '@/types';

export const projectsAPI = {
    /** Fetch all user projects */
    getAll: async () => {
        return apiGet<Project[]>('/api/projects');
    },

    /** Create a new project */
    create: async (data: { name: string; emoji_icon?: string }) => {
        return apiPost<Project>('/api/projects', data);
    },

    /** Update an existing project */
    update: async (id: string, patch: Partial<Project>) => {
        return apiPut<Project>(`/api/projects/${id}`, patch);
    },

    /** Delete a project */
    delete: async (id: string) => {
        return apiDelete(`/api/projects/${id}`);
    }
};
