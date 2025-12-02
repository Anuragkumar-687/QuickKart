import axios from 'axios';
import { getSession } from 'next-auth/react';

const api = axios.create({
    baseURL: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api',
});

api.interceptors.request.use(async (config) => {
    const session = await getSession();
    if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
});

export default api;
