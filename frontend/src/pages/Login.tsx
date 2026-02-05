import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Login: React.FC = () => {
    const { login, isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/" />;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md w-96 text-center">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Welcome Back</h1>
                <p className="text-gray-600 mb-8">Sign in to manage your emails</p>

                <button
                    onClick={login}
                    className="flex items-center justify-center w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M21.35 11.1h-9.17v2.73h6.51c-.33 1.76-1.77 3.12-3.78 3.12-2.74 0-4.96-2.26-4.96-5s2.22-5 4.96-5c1.17 0 2.29.41 3.16 1.15l2.05-2.05C18.73 4.54 16.66 3 14.18 3 8.85 3 4.5 7.35 4.5 12.68s4.35 9.68 9.68 9.68c5.58 0 9.17-3.92 9.17-9.32 0-.64-.07-1.25-.17-1.84z"
                        />
                    </svg>
                    Sign in with Google
                </button>
            </div>
        </div>
    );
};

export default Login;
