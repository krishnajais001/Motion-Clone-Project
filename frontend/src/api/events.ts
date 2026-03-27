import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import type { Event } from '../lib/services/event.service';

/**
 * Fetch all events within a date range.
 */
export const fetchEvents = async (params: { start: string; end: string }) => {
  return apiGet<Event[]>('/api/events', params);
};

/**
 * Create a new event.
 */
export const createEvent = async (event: Partial<Event>) => {
  return apiPost<Event>('/api/events', event);
};

/**
 * Update an existing event.
 */
export const updateEvent = async ({ id, patch }: { id: string; patch: Partial<Event> }) => {
  return apiPut<Event>(`/api/events/${id}`, patch);
};

/**
 * Delete an event.
 */
export const deleteEvent = async (id: string) => {
  return apiDelete(`/api/events/${id}`);
};
