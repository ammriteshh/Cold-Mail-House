import { useAuth } from '../context/AuthContext';

export const EnterDashboardButton = () => {
    const { login } = useAuth();

    return (
        <button
            type="button"
            onClick={login}
            className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white bg-indigo-600 border border-indigo-500 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-sm"
        >
            Enter Dashboard
        </button>
    );
};
