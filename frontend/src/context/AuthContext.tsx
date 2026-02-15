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

                // Decode simple payload from token for UI state
                const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
                setUser({
                    id: payload.userId,
                    name: payload.name || 'User',
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
        try {
            const { data } = await client.post('/auth/login', { email, password });
            window.accessToken = data.accessToken;
            setUser(data.user);
        } catch (error) {
            console.error("Login Failed:", error);
            throw error;
        }
    };

    const register = async (name: string, email: string, password: string) => {
        try {
            await client.post('/auth/register', { name, email, password });
        } catch (error) {
            console.error("Registration Failed:", error);
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
