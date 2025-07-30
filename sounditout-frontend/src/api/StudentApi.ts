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
    }
): Promise<void> => {
    await api.post(`/reports/${id}`, report);
};

export const deleteStudent = async (id: number): Promise<void> => {
    await api.delete(`/students/${id}`);
};

