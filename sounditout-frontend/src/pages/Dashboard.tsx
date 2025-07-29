import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { ProgressReport } from '../types/ProgressReport';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

interface DecodedToken {
    fullName: string;
    studentGroup?: string;
    exp: number;
}

const getDifficultyColor = (difficulty: number): string => {
    if (difficulty >= 1 && difficulty <= 3) return 'bg-green-500';
    if (difficulty >= 4 && difficulty <= 6) return 'bg-yellow-500';
    return 'bg-red-500';
};

const Dashboard: React.FC = () => {
    const [reports, setReports] = useState<ProgressReport[]>([]);
    const [error, setError] = useState('');
    const [fullName, setFullName] = useState('');
    const [studentGroup, setStudentGroup] = useState('');
    const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('You must be logged in.');
            return;
        }

        try {
            const decoded = jwtDecode<DecodedToken>(token);
            setFullName(decoded.fullName);
            if (decoded.studentGroup) {
                setStudentGroup(decoded.studentGroup);
            }
        } catch (err) {
            console.error('Failed to decode token:', err);
        }

        const fetchReports = async () => {
            try {
                const response = await api.get<ProgressReport[]>('/reports/my', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const sorted = response.data.sort(
                    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                );
                setReports(sorted);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch reports');
            }
        };

        fetchReports();
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        if (darkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 transition-colors">
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        Student Dashboard
                    </h2>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`px-3 py-1 text-sm rounded border focus:outline-none ${
                            darkMode
                                ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600'
                                : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
                        }`}
                    >
                        {darkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="px-3 py-1 text-sm rounded border bg-red-100 text-red-700 hover:bg-red-200 border-red-400"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow">
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {fullName ? `${fullName}'s Reports` : 'My Reports'}
                    </h2>
                    {studentGroup && (
                        <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                            <span className="font-semibold">Group:</span> {studentGroup}
                        </p>
                    )}
                </div>

                {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reports.map((report) => (
                        <div
                            key={report.id}
                            className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded p-4 shadow hover:shadow-lg transition duration-300 relative"
                        >
                            <span
                                className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getDifficultyColor(
                                    report.difficulty
                                )}`}
                                title={`Difficulty: ${report.difficulty}`}
                            ></span>

                            <p className="text-sm text-gray-500 dark:text-gray-300">
                                {new Date(report.date).toLocaleDateString()}
                            </p>
                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-1">
                                {report.lessonTopic}
                            </h3>
                            <p className="text-gray-700 dark:text-gray-200">
                                <span className="font-semibold">Level:</span> {report.initialGradeLevel}
                            </p>
                            <p className="text-gray-700 dark:text-gray-200">
                                <span className="font-semibold">Difficulty:</span> {report.difficulty}
                            </p>
                            <p className="text-gray-700 dark:text-gray-200">
                                <span className="font-semibold">Milestone:</span> {report.milestone}
                            </p>
                            <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">
                                {report.notes}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
