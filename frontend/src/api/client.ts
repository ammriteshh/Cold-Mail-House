
import axios from 'axios';

// Detect the current environment using window.location
const detectApiBase = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    // If we are in development (localhost)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000';
    }
    // Fallback for production if env var is missing (not recommended but safe default)
    return 'https://cold-mail-house.onrender.com/api';
};

export const client = axios.create({
    baseURL: detectApiBase(),
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // Important for sessions!
});


/**
 * Response Interceptor: Handle 401 Errors
 * For session-based auth, a 401 means the session is expired or invalid.
 * We should redirect to login.
 */
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Optional: Redirect to login page if 401 received
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

