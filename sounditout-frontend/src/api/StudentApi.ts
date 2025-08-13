import api from './axios';
import { Student, StudentDTO } from '../types/Student';
import { ProgressReport } from '../types/ProgressReport';

// Updated return types for consistent typing
export const getAllStudents = async (): Promise<Student[]> => {
    const res = await api.get<Student[]>('/students');
    return res.data;
};

export const searchStudentsByName = async (name: string): Promise<Student[]> => {
    const res = await api.get<Student[]>(`/students/search`, { params: { name } });
    return res.data;
};

export const getStudentById = async (id: number): Promise<StudentDTO> => {
    const res = await api.get<StudentDTO>(`/students/${id}`);
    return res.data;
};

export const updateStudentGroup = (studentId: number, data: { studentGroup: string }) => {
    return api.patch(`/students/${studentId}/group`, data);
};

export const getReportsByStudentId = async (studentId: number): Promise<ProgressReport[]> => {
    const response = await api.get<ProgressReport[]>(`/reports/student/${studentId}`);
    return response.data;
};


export const addProgressReport = async (
    id: number,
    report: {
        date: string;
        lessonTopic: string;
        initialGradeLevel: number;
        difficulty: number;
        milestone: string;
        notes: string;
        accomplishments?: string;       // NEW
        improvementsNeeded?: string;    // NEW
    }
): Promise<void> => {
    await api.post(`/reports/${id}`, report);
};

export const deleteStudent = async (id: number): Promise<void> => {
    await api.delete(`/students/${id}`);
};

/* ================================
   NEW: ProgressReport Edit/Delete
   ================================ */

// UPDATE a progress report
export const updateProgressReport = async (
    reportId: number,
    body: {
        date: string;
        lessonTopic: string;
        initialGradeLevel: number;
        difficulty: number;
        milestone: string;
        notes: string;
        accomplishments?: string;
        improvementsNeeded?: string;
    }
): Promise<ProgressReport> => {
    const { data } = await api.put<ProgressReport>(`/reports/${reportId}`, body);
    return data;
};

// DELETE a progress report
export const deleteProgressReport = async (reportId: number): Promise<void> => {
    await api.delete(`/reports/${reportId}`);
};