import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const AuthCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // Redirect to dashboard or home
            navigate('/');
            window.location.reload(); // To refresh AuthContext state
        } else {
            navigate('/login?error=auth_failed');
        }
    }, [searchParams, navigate]);

    return <div>Processing authentication...</div>;
};

export default AuthCallback;
