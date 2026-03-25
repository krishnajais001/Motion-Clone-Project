import { apiGet, apiPost, apiPut, apiDelete } from '../api';

export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'blocked';
export type TaskPriority = 'none' | 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
    id: string;
    page_id?: string;
    parent_id?: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date?: string;
    order_index: number;
    created_at: string;
    updated_at: string;
}

export const TaskService = {
    getAll: (params?: { page_id?: string }) => apiGet<Task[]>('/api/tasks', params),
    create: (data: Partial<Task>) => apiPost<Task>('/api/tasks', data),
    update: (id: string, data: Partial<Task>) => apiPut<Task>(`/api/tasks/${id}`, data),
    delete: (id: string) => apiDelete(`/api/tasks/${id}`),
};
