import { apiGet, apiPost, apiPut, apiDelete } from '../api';

export interface Event {
    id: string;
    page_id?: string;
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    all_day: boolean;
    color: string;
    created_at: string;
    updated_at: string;
}

export const EventService = {
    getAll: (params: { start: string; end: string }) => apiGet<Event[]>('/api/events', params),
    create: (data: Partial<Event>) => apiPost<Event>('/api/events', data),
    update: (id: string, data: Partial<Event>) => apiPut<Event>(`/api/events/${id}`, data),
    delete: (id: string) => apiDelete(`/api/events/${id}`),
};
