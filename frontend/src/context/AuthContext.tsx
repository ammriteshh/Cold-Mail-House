import React, { createContext, useContext, useState } from 'react';
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
    login: () => void;
    register: () => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const defaultUser: User = { id: 'public', name: 'Guest', email: 'guest@public.com', role: 'user' };
    const [user] = useState<User | null>(defaultUser);

    const login = async () => {};
    const logout = async () => { window.location.href = '/'; };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: true, isLoading: false, login, register: login, logout }}>
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
