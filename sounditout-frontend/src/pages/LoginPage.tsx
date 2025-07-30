import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';
import { LoginRequest, AuthResponse } from '../types/Auth';

interface DecodedToken {
    sub: string;
    roles?: string[];
    role?: string;
    exp: number;
}

const getUserRole = (roles: string[]): 'admin' | 'student' | 'unknown' => {
    if (roles.includes('ROLE_ADMIN')) return 'admin';
    if (roles.includes('ROLE_STUDENT')) return 'student';
    return 'unknown';
};

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const loginData: LoginRequest = { email, password };
            const response = await api.post<AuthResponse>('/auth/login', loginData);

            const token = response.data.token;
            if (!token || typeof token !== 'string') {
                setError('No valid token received');
                return;
            }

            localStorage.setItem('token', token);

            const decoded = jwtDecode<DecodedToken>(token);
            const roleList: string[] = decoded.roles ?? (decoded.role ? [decoded.role] : []);
            const role = getUserRole(roleList);

            switch (role) {
                case 'admin':
                    navigate('/dashboard');
                    break;
                case 'student':
                    navigate('/home');
                    break;
                default:
                    setError('Unauthorized role');
            }

        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Login</h2>

                {error && <p className="text-red-500 mb-2">{error}</p>}

                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="w-full p-2 border border-gray-300 rounded"
                    />

                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            className="w-full p-2 border border-gray-300 rounded pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(prev => !prev)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-blue-600"
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                    >
                        Login
                    </button>
                </form>

                <p className="mt-4 text-sm text-center">
                    Don’t have an account?{' '}
                    <a href="/register" className="text-blue-600 hover:underline font-medium">
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
