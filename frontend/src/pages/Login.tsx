import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const Login: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <SignIn />
        </div>
    );
};

export default Login;
