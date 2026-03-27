import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

export interface StudySubject {
    id: string;
    name: string;
    time_spent_today: number;
    last_reset_date: string;
}

export interface StudySession {
    id: string;
    subject_name: string;
    duration: number;
    timestamp: string;
}

export const fetchSubjects = async () => {
    return apiGet<StudySubject[]>('/api/study/subjects');
};

export const createSubject = async (name: string) => {
    return apiPost<StudySubject>('/api/study/subjects', { name });
};

export const incrementTime = async (id: string, duration: number) => {
    return apiPut<StudySubject>(`/api/study/subjects/${id}/increment`, { duration });
};

export const deleteSubject = async (id: string) => {
    return apiDelete(`/api/study/subjects/${id}`);
};

export const fetchSessions = async () => {
    return apiGet<StudySession[]>('/api/study/sessions');
};

export const logSession = async (subject_name: string, duration: number) => {
    return apiPost<StudySession>('/api/study/sessions', { subject_name, duration });
};
