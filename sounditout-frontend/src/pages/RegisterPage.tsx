import React, { useState } from 'react';
import { useNavigate, Link } from "react-router-dom";
import api from '../api/axios';
import { RegisterRequest } from '../types/Auth';
import { GradeRange } from '../types/Enums';

const RegisterPage: React.FC = () => {
    const [form, setForm] = useState<RegisterRequest>({
        email: '',
        username: '',
        password: '',
        fullName: '',
        gradeRange: GradeRange.GRADE_1_4,
        age: 0,
        isAdmin: false,
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [passwordStrength, setPasswordStrength] = useState('');
    const navigate = useNavigate();

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: name === 'age' ? Number(value) : value,
        }));

        if (name === 'password') {
            updatePasswordStrength(value);
        }
    };

    const updatePasswordStrength = (password: string) => {
        if (password.length < 6) {
            setPasswordStrength('Weak');
        } else if (
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /\d/.test(password) &&
            password.length >= 8
        ) {
            setPasswordStrength('Strong');
        } else {
            setPasswordStrength('Medium');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const { email, username, password, fullName, age } = form;

        if (
            !email.trim() ||
            !username.trim() ||
            !password.trim() ||
            !fullName.trim() ||
            isNaN(age) || age <= 0
        ) {
            setError('All fields are required and must be valid.');
            return;
        }

        try {
            const response = await api.post('/auth/register', form);
            setSuccess('Registration successful!');
            console.log(response.data);

            setTimeout(() => navigate('/login'), 1000);
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message || 'Registration failed. Please try again.';
            setError(errorMessage);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Register</h2>

                {error && <p className="text-red-500 mb-2">{error}</p>}
                {success && <p className="text-green-500 mb-2">{success}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded"
                    />

                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={form.username}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded"
                    />

                    {form.password && (
                        <div className="text-sm">
                            Password Strength:{' '}
                            <span
                                className={
                                    passwordStrength === 'Strong'
                                        ? 'text-green-600'
                                        : passwordStrength === 'Medium'
                                            ? 'text-yellow-600'
                                            : 'text-red-600'
                                }
                            >
                                {passwordStrength}
                            </span>
                        </div>
                    )}

                    <input
                        type="text"
                        name="fullName"
                        placeholder="Full Name"
                        value={form.fullName}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded"
                    />

                    <select
                        name="gradeRange"
                        value={form.gradeRange}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded"
                    >
                        <option value="">Select Grade Range</option>
                        <option value={GradeRange.GRADE_1_4}>Grades 1–4</option>
                        <option value={GradeRange.GRADE_5_6}>Grades 5–6</option>
                        <option value={GradeRange.GRADE_7_9}>Grades 7–9</option>
                        <option value={GradeRange.GRADE_10_12}>Grades 10–12</option>
                    </select>

                    <input
                        type="number"
                        name="age"
                        placeholder="Age"
                        value={form.age}
                        onChange={handleChange}
                        required
                        min={3}
                        className="w-full p-2 border border-gray-300 rounded"
                    />

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                    >
                        Register
                    </button>
                </form>

                <p className="mt-4 text-sm text-center">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline font-medium">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
