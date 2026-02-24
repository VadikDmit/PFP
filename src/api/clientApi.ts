import axios from 'axios';
import type { Client } from '../types/client';

const API_BASE_URL = import.meta.env.NEXT_PUBLIC_API_URL || 'https://pfpbackend-production.up.railway.app/api';
const PROJECT_KEY = import.meta.env.NEXT_PUBLIC_PROJECT_KEY || 'pk_9cfe10dcec21667bd5c557ea';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to inject the token and project key
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    // Multi-tenancy header
    config.headers['X-Project-Key'] = PROJECT_KEY;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export { PROJECT_KEY };

export const clientApi = {
    // --- AUTH ---
    registerFast: async (payload: { email: string, password: string, name?: string }): Promise<any> => {
        const response = await api.post('/auth/register-fast', {
            email: payload.email,
            password: payload.password,
            name: payload.name,
            project_key: PROJECT_KEY,
        });
        return response.data;
    },

    login: async (email: string, password: string): Promise<any> => {
        const response = await api.post('/auth/login', {
            email,
            password,
        });
        return response.data;
    },

    // --- CLIENT CABINET (B2C) ---

    // Get my financial plan
    getMyPlan: async (): Promise<Client> => {
        const response = await api.get('/my/plan');
        return response.data;
    },

    // Create initial plan (first-run)
    firstRun: async (payload: any): Promise<any> => {
        const response = await api.post('/my/plan/first-run', payload);
        return response.data;
    },

    // Recalculate specific goal
    recalculate: async (goalId: number, payload: any): Promise<any> => {
        const response = await api.post(`/my/plan/${goalId}/recalculate`, payload);
        return response.data;
    },

    // Add new goal to existing plan
    addGoal: async (payload: any): Promise<any> => {
        const response = await api.post('/my/plan/goals', payload);
        return response.data;
    },

    // Get report data
    getReport: async (clientId: number): Promise<any> => {
        const response = await api.get(`/my/reports/${clientId}`);
        return response.data;
    },
};
