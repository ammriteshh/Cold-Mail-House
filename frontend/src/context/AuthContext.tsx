import React, { createContext, useContext, useState, useEffect } from 'react';
import { client } from '../api/client';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check auth on mount (refresh token)
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data } = await client.post('/auth/refresh');
                window.accessToken = data.accessToken;

                // Ideally, we'd have a /me endpoint to get user info, 
                // but for now we decode from token or store basic info if available. 
                // Let's assume refresh returns user info or we just set auth state.
                // For better UX, let's fetch user profile if possible. 
                // Since our refresh endpoint only returns accessToken, let's just mark as authenticated.
                // A better approach: add /auth/me endpoint. For now, we'll try to decode or just assume auth.
                // WAIT: The login response returns user info. We should persist that or fetch it.
                // Let's rely on validation for now.

                const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
                setUser({
                    id: payload.userId,
                    name: payload.name || 'User', // Token might not have name, handled in Login
                    email: payload.email || '',
                    role: payload.role
                });
            } catch (error) {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const { data } = await client.post('/auth/login', { email, password });
        window.accessToken = data.accessToken;
        setUser(data.user);
    };

    const register = async (name: string, email: string, password: string) => {
        console.log("AuthContext: register called with", { name, email });
        try {
            const res = await client.post('/auth/register', { name, email, password });
            console.log("AuthContext: register response", res);
        } catch (error) {
            console.error("AuthContext: register error", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await client.post('/auth/logout');
        } finally {
            window.accessToken = undefined;
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
