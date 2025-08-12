import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getStudentById,
    getReportsByStudentId,
    updateStudentGroup,
    addProgressReport,
    deleteStudent,
} from '../api/StudentApi';
import { StudentDTO } from '../types/Student';
import { StudentGroup } from '../types/Enums';

interface Report {
    id: number;
    lessonTopic: string;
    initialGradeLevel: number;
    difficulty: number;
    milestone: string;
    notes: string;
    date: string;
    accomplishments?: string;      // NEW
    improvementsNeeded?: string;   // NEW
}

const StudentDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const studentId = Number(id);
    const navigate = useNavigate();

    const [student, setStudent] = useState<StudentDTO | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const [message, setMessage] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [expandedReportId, setExpandedReportId] = useState<number | null>(null);
    const [frontendGrade, setFrontendGrade] = useState<string>(() => {
        return localStorage.getItem(`frontendGrade-${studentId}`) || '';
    });

    const [formData, setFormData] = useState({
        date: '',
        lessonTopic: '',
        initialGradeLevel: '' as number | '',
        difficulty: '' as number | '',
        milestone: '',
        notes: '',
        accomplishments: '',       // NEW
        improvementsNeeded: ''     // NEW
    });

    useEffect(() => {
        fetchStudentDetails();
        fetchReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [studentId]);

    const fetchStudentDetails = async () => {
        try {
            const studentData = await getStudentById(studentId);
            setStudent(studentData);
        } catch (error) {
            console.error('Error fetching student details:', error);
        }
    };

    const fetchReports = async () => {
        try {
            const reportData = await getReportsByStudentId(studentId);
            const sorted = reportData.sort(
                (a: Report, b: Report) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            setReports(sorted);
        } catch (error) {
            console.error('Error fetching reports:', error);
        }
    };

    const handleGroupChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newGroup = e.target.value as StudentGroup;
        try {
            await updateStudentGroup(studentId, { studentGroup: newGroup });
            setStudent(prev => prev ? { ...prev, studentGroup: newGroup } : null);
            setMessage('Group updated successfully');
        } catch (error) {
            console.error('Error updating group:', error);
            setMessage('Failed to update group');
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleReportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addProgressReport(studentId, {
                ...formData,
                initialGradeLevel: Number(formData.initialGradeLevel),
                difficulty: Number(formData.difficulty),
            });
            setMessage('New report added!');
            setFormData({
                date: '',
                lessonTopic: '',
                initialGradeLevel: '',
                difficulty: '',
                milestone: '',
                notes: '',
                accomplishments: '',
                improvementsNeeded: ''
            });
            setShowForm(false);
            fetchReports();
        } catch (error) {
            console.error('Error adding report:', error);
        }
    };

    const handleDeleteStudent = async () => {
        const confirmDelete = window.confirm(
            `Are you sure you want to delete student "${student?.fullName}"? This action cannot be undone.`
        );
        if (confirmDelete) {
            try {
                await deleteStudent(studentId);
                alert('Student deleted successfully.');
                navigate('/dashboard');
            } catch (error) {
                console.error('Error deleting student:', error);
                alert('Failed to delete student.');
            }
        }
    };

    const toggleExpandedReport = (id: number) => {
        setExpandedReportId(prev => (prev === id ? null : id));
    };

    const handleFrontendGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newGrade = e.target.value;
        setFrontendGrade(newGrade);
        localStorage.setItem(`frontendGrade-${studentId}`, newGrade);
    };

    if (!student) return <p className="text-center text-gray-600 dark:text-gray-300">Loading student...</p>;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-800 dark:text-gray-100 transition">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                {/* Top Bar: Back and Delete */}
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        ← Back to Dashboard
                    </button>
                    <button
                        onClick={handleDeleteStudent}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded"
                    >
                        Delete Student
                    </button>
                </div>

                <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {student.fullName}
                </h2>

                {message && <p className="text-green-600 dark:text-green-400 mb-3">{message}</p>}

                <div className="space-y-1 mb-4">
                    <label className="block font-medium">
                        Student Group:
                        <select
                            value={student.studentGroup}
                            onChange={handleGroupChange}
                            className="ml-2 border rounded p-1 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">Select</option>
                            <option value="UNASSIGNED">Unassigned</option>
                            <option value="BELOW_AVERAGE">Below Average</option>
                            <option value="EMERGING">Emerging</option>
                            <option value="DEVELOPING">Developing</option>
                            <option value="READY">Ready</option>
                        </select>
                    </label>

                    <div className="flex items-center gap-2">
                        <label className="font-medium">
                            Grade:
                            <select
                                value={frontendGrade}
                                onChange={handleFrontendGradeChange}
                                className="ml-2 border rounded p-1 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">Select</option>
                                {[...Array(12)].map((_, i) => (
                                    <option key={i + 1} value={(i + 1).toString()}>
                                        {i + 1}
                                    </option>
                                ))}
                                <option value="12+">12+</option>
                            </select>
                        </label>
                    </div>

                    <p>
                        <strong>Grade Range:</strong> {student.gradeRange} ({student.grade})
                    </p>
                    <p><strong>Age:</strong> {student.age}</p>
                </div>

                <hr className="my-6 border-gray-300 dark:border-gray-700" />

                <h3 className="text-xl font-semibold mb-4">Progress Reports</h3>
                <ul className="space-y-3 mb-6">
                    {reports.map((report) => (
                        <li
                            key={report.id}
                            onClick={() => toggleExpandedReport(report.id)}
                            className="p-4 border rounded cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600"
                        >
                            <p className="font-semibold text-gray-800 dark:text-gray-100">
                                {new Date(report.date).toLocaleDateString()} - {report.lessonTopic}
                            </p>
                            {expandedReportId === report.id && (
                                <div className="mt-2 text-sm text-gray-700 dark:text-gray-200 space-y-1 break-words">
                                    <p><strong>Initial Grade Level:</strong> {report.initialGradeLevel}</p>
                                    <p><strong>Difficulty:</strong> {report.difficulty}</p>
                                    <p><strong>Milestone:</strong> {report.milestone}</p>
                                    <p className="whitespace-pre-line">
                                        <strong>Notes:</strong> {report.notes}
                                    </p>
                                    {report.accomplishments && (
                                        <p className="whitespace-pre-line">
                                            <strong>Accomplishments:</strong> {report.accomplishments}
                                        </p>
                                    )}
                                    {report.improvementsNeeded && (
                                        <p className="whitespace-pre-line">
                                            <strong>Improvements Needed:</strong> {report.improvementsNeeded}
                                        </p>
                                    )}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>

                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-4"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel' : 'Write a New Report'}
                </button>

                {showForm && (
                    <form onSubmit={handleReportSubmit} className="grid gap-3 max-w-xl">
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleFormChange}
                            className="border p-2 rounded dark:bg-gray-700 dark:text-white"
                            required
                        />
                        <input
                            type="text"
                            name="lessonTopic"
                            placeholder="Lesson Topic"
                            value={formData.lessonTopic}
                            onChange={handleFormChange}
                            className="border p-2 rounded dark:bg-gray-700 dark:text-white"
                            required
                        />
                        <input
                            type="number"
                            name="initialGradeLevel"
                            placeholder="Initial Grade Level"
                            value={formData.initialGradeLevel}
                            onChange={handleFormChange}
                            className="border p-2 rounded dark:bg-gray-700 dark:text-white"
                            required
                        />
                        <input
                            type="number"
                            name="difficulty"
                            placeholder="Difficulty (1–10)"
                            value={formData.difficulty}
                            onChange={handleFormChange}
                            className="border p-2 rounded dark:bg-gray-700 dark:text-white"
                            required
                        />
                        <input
                            type="text"
                            name="milestone"
                            placeholder="Milestone"
                            value={formData.milestone}
                            onChange={handleFormChange}
                            className="border p-2 rounded dark:bg-gray-700 dark:text-white"
                        />
                        <textarea
                            name="notes"
                            placeholder="Additional Notes"
                            value={formData.notes}
                            onChange={handleFormChange}
                            className="border p-2 rounded dark:bg-gray-700 dark:text-white"
                            rows={3}
                        />
                        <textarea
                            name="accomplishments"
                            placeholder="Accomplishments (optional)"
                            value={formData.accomplishments}
                            onChange={handleFormChange}
                            className="border p-2 rounded dark:bg-gray-700 dark:text-white"
                            rows={3}
                        />
                        <textarea
                            name="improvementsNeeded"
                            placeholder="Improvements Needed (optional)"
                            value={formData.improvementsNeeded}
                            onChange={handleFormChange}
                            className="border p-2 rounded dark:bg-gray-700 dark:text-white"
                            rows={3}
                        />

                        <button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                        >
                            Submit Report
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default StudentDetail;
