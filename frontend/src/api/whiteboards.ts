import { apiGet, apiPost } from '@/lib/api';

export const fetchWhiteboards = async () => {
    return apiGet<any[]>('/api/whiteboards');
};

export const saveWhiteboard = async (payload: any) => {
    return apiPost<any>('/api/whiteboards/save', payload);
};
