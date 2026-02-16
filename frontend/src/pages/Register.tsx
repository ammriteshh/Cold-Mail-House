
import { Link } from 'react-router-dom';
import { GoogleLoginButton } from '../components/GoogleLoginButton';

const Register = () => {


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                    <p className="text-gray-400">Join Cold Mail House</p>
                </div>



                <div className="space-y-4">
                    <GoogleLoginButton />
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-600"></div>
                    </div>
                </div>

                <div className="text-center text-xs text-gray-500">
                    By signing up, you agree to our Terms of Service and Privacy Policy.
                </div>
                <div className="text-center text-sm mt-4">
                    Already have an account? <Link to="/login" className="text-blue-400 hover:underline">Login</Link>
                </div>
            </div >
        </div >
    );

};

export default Register;
