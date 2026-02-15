
import axios from 'axios';

// Detect the current environment using window.location
const detectApiBase = () => {
    // If we are in development (localhost), assume backend is on 3000
    if (window.location.hostname === 'localhost') {
        return 'http://localhost:3000';
    }

    // For production, use the relative path or deployed URL
    // Adjust this logic based on your specific deployment setup
    return import.meta.env.VITE_API_URL || 'https://cold-mail-house.onrender.com';
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

