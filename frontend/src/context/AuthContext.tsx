
import React, { createContext, useContext, useState, useEffect } from 'react';
import { client } from '../api/client';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    googleId?: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email?: string, password?: string) => Promise<void>;
    register: (name?: string, email?: string, password?: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check auth on mount (session)
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data } = await client.get('/auth/me');
                setUser(data.user);
            } catch (error) {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async () => {
        // Redirect to backend Google Auth
        window.location.href = `${client.defaults.baseURL}/auth/google`;
    };

    // Register is deprecated in favor of Google OAuth, but reusing the login flow
    const register = async () => {
        // Same as login for OAuth
        await login();
    };

    const logout = async () => {
        try {
            await client.post('/auth/logout');
            setUser(null);
            // Optional: redirect to login page or home
            window.location.href = '/login';
        } catch (error) {
            console.error("Logout failed", error);
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

