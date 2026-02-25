import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EnterDashboardButton } from '../components/EnterDashboardButton';

const Login = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, isLoading, navigate]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
            <div className="w-full max-w-md p-8 space-y-8 bg-slate-800 rounded-xl shadow-2xl border border-slate-700">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-slate-400 border-none">Personal Cold Outreach Dashboard</p>
                </div>

                <div className="space-y-4">
                    <EnterDashboardButton />
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-600"></div>
                    </div>
                </div>

                <div className="text-center text-xs text-gray-500">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </div>
            </div >
        </div >
    );

};

export default Login;
