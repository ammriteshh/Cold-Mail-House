import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const client = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Important for sending cookies
});

// Request Interceptor: Attach Access Token
client.interceptors.request.use(
    (config) => {
        const token = window.accessToken; // Access token stored in memory (global var or context)
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & Refresh
client.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Attempt refresh
                const { data } = await client.post('/auth/refresh');
                const newAccessToken = data.accessToken;

                // Update memory
                window.accessToken = newAccessToken;

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return client(originalRequest);
            } catch (refreshError) {
                // Refresh failed - redirect to login
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Declare global type for window
declare global {
    interface Window {
        accessToken?: string;
    }
}
