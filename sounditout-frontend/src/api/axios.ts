import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(config => {
    const publicEndpoints = ['/auth/register', '/auth/login'];

    if (!publicEndpoints.some(path => config.url?.includes(path))) {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = config.headers ?? {}; // Ensure headers is defined
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    return config;
});

export default api;
