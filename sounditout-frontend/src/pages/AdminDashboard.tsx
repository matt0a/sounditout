import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentCard from '../components/StudentCard';
import SearchBar from '../components/SearchBar';
import { getAllStudents, searchStudentsByName } from '../api/StudentApi';

interface Student {
    id: number;
    fullName: string;
}

const AdminDashboard: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [search, setSearch] = useState('');
    const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
    const navigate = useNavigate();

    const fetchStudents = async () => {
        const res = await getAllStudents();
        setStudents(res);
    };

    const handleSearch = async (value: string) => {
        setSearch(value);
        if (value.trim()) {
            const res = await searchStudentsByName(value);
            setStudents(res);
        } else {
            fetchStudents();
        }
    };

    useEffect(() => {
        fetchStudents();
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
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 px-6 py-10 transition-colors">
            <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-blue-200 dark:border-blue-500">
                {/* Top Bar */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                    <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        Admin Dashboard
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {/* NEW: Admin AI Tools */}
                        <button
                            onClick={() => navigate('/admin/ai-tools')}
                            className="px-3 py-1 text-sm rounded border bg-blue-600 text-white hover:bg-blue-700"
                        >
                            AI Tools
                        </button>
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

                <SearchBar value={search} onChange={handleSearch} />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    {students.map((student) => (
                        <StudentCard
                            key={student.id}
                            fullName={student.fullName}
                            onClick={() => navigate(`/students/${student.id}`)}
                        />
                    ))}
                </div>

                {/* Empty state */}
                {students.length === 0 && (
                    <div className="text-center text-sm text-gray-600 dark:text-gray-300 mt-6">
                        No students found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
