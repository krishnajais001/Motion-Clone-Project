import axios from 'axios';
import { getAccessToken } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Axios instance with base URL and default headers.
 */
export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Interceptor to automatically attach the Supabase JWT as a Bearer token.
 */
api.interceptors.request.use(async (config) => {
    const token = await getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * Simplified wrapper for handling response data.
 */
export const apiFetch = async <T = any>(
    endpoint: string,
    options: { method?: string; data?: any; params?: any } = {}
): Promise<T> => {
    const { method = 'GET', data, params } = options;
    const response = await api.request({
        url: endpoint,
        method,
        data,
        params,
    });
    return response.data;
};

// Convenience methods
export const apiGet = <T = any>(endpoint: string, params?: any) => apiFetch<T>(endpoint, { method: 'GET', params });
export const apiPost = <T = any>(endpoint: string, data?: any) => apiFetch<T>(endpoint, { method: 'POST', data });
export const apiPut = <T = any>(endpoint: string, data?: any) => apiFetch<T>(endpoint, { method: 'PUT', data });
export const apiDelete = <T = any>(endpoint: string) => apiFetch<T>(endpoint, { method: 'DELETE' });
