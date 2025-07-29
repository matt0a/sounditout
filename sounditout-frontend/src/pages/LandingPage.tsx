import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/kaylz-logo.png';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col justify-between bg-gradient-to-r from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
            {/* Main Content */}
            <div className="flex flex-col items-center justify-center px-6 py-12 lg:flex-row lg:justify-center lg:gap-20 flex-grow">

                {/* Branding Section */}
                <div className="text-center">
                    <img
                        src={logo}
                        alt="Kaylz Logo"
                        className="w-40 mx-auto mb-6 rounded"
                    />
                    <h1 className="text-4xl md:text-5xl font-bold text-blue-700 dark:text-blue-300 mb-4">
                        Kaylz Enterprise
                    </h1>
                    <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 font-semibold max-w-sm mx-auto">
                        "If better can be had, then good is not good enough."
                    </p>
                </div>

                {/* Action Block */}
                <div className="mt-10 lg:mt-0 bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 w-full max-w-sm border border-blue-200 dark:border-blue-600">
                    <h2 className="text-2xl font-bold text-center text-blue-600 dark:text-blue-300 mb-6">
                        Get Started
                    </h2>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition"
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white py-2 px-4 rounded transition"
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-transparent text-center py-6 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                <p>&copy; {new Date().getFullYear()} Kaylz Enterprise. All rights reserved.</p>
                <p className="italic">"If better can be had, then good is not good enough."</p>
            </footer>
        </div>
    );
};

export default LandingPage;
