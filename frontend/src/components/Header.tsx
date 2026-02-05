import React from 'react';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div className="text-xl font-bold text-gray-800">CMH</div>
                {user && (
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            {user.avatar && <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />}
                            <span className="text-gray-700 font-medium">{user.name}</span>
                        </div>
                        <button
                            onClick={logout}
                            className="text-sm text-red-600 hover:text-red-800"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
