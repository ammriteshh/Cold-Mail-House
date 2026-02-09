import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div className="text-xl font-bold text-gray-800">CMH</div>
                <div className="flex items-center space-x-4">
                    <span className="text-gray-700 font-medium">Guest User</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
