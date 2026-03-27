import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import type { Task } from '../lib/services/task.service';

/**
 * Fetch all tasks (optionally filtered by page).
 */
export const fetchTasks = async (params?: { page_id?: string }) => {
  return apiGet<Task[]>('/api/tasks', params);
};

/**
 * Create a new task.
 */
export const createTask = async (task: Partial<Task>) => {
  return apiPost<Task>('/api/tasks', task);
};

/**
 * Update an existing task.
 */
export const updateTask = async ({ id, patch }: { id: string; patch: Partial<Task> }) => {
  return apiPut<Task>(`/api/tasks/${id}`, patch);
};

/**
 * Delete a task.
 */
export const deleteTask = async (id: string) => {
  return apiDelete(`/api/tasks/${id}`);
};
