import axios from 'axios';
import { getSession } from 'next-auth/react';

export const API_BASE_URL =
    (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000') + '/api';

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use(async (config) => {
    const session = await getSession();
    if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
});

export default api;
