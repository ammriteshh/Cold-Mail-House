
import { useAuth } from '../context/AuthContext';

export const GoogleLoginButton = () => {
    const { login } = useAuth();

    return (
        <button
            type="button"
            onClick={login}
            className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 border border-blue-500 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-sm"
        >
            Enter Dashboard
        </button>
    );
};
