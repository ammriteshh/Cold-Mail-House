import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AuthCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setIsAuthenticated } = useAuth(); // Need to expose this from context or trigger a re-check

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Update AuthContext state without reload
            setIsAuthenticated(true);
            navigate('/');
        } else {
            navigate('/login?error=auth_failed');
        }
    }, [searchParams, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-xl">Logging you in...</div>
        </div>
    );
};

export default AuthCallback;
