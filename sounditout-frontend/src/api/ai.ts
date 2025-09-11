// src/api/ai.ts
import api from './axios';

// ---------- Types ----------
export type StudyTask = {
    day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
    title: string;
    steps: string[];
};

export type StudyPlan = {
    id: number;
    studentId: number;
    weekStart: string; // ISO date
    goals: string;
    tasksJson: string; // raw JSON string from model
    createdAt?: string;
};

export type UpsertEmbeddingRequest = {
    subject?: string;
    content: string;
};

export type SearchResult = {
    id: number;
    student_id: number;
    report_id: number;
    subject: string | null;
    content: string;
    created_at: string;
};

// ---------- Student endpoints ----------
/** Generate & persist a weekly plan for the logged-in student. */
export async function generateStudyPlan(goal: string) {
    const res = await api.get<StudyPlan>('/ai/study-plan', {
        params: { goal },
    });
    return res.data;
}

/** RAG: nearest-neighbor search over the logged-in student’s report chunks. */
export async function searchSimilar(query: string, k = 5) {
    const res = await api.get<{
        studentId: number;
        query: string;
        k: number;
        results: SearchResult[];
    }>('/ai/search', { params: { query, k } });
    return res.data;
}

/** Upsert an embedding for a report (logged-in student context). */
export async function upsertReportEmbedding(reportId: number, body: UpsertEmbeddingRequest) {
    await api.post(`/ai/reports/${reportId}/embed`, body);
}

// ---------- Admin endpoints ----------
/** Rebuild embeddings for all reports of a student (ADMIN). */
export async function adminReindex(studentId: number) {
    const res = await api.post<{ studentId: number; reindexed: number }>(
        '/admin/ai/reindex',
        null,
        { params: { studentId } }
    );
    return res.data;
}

/** Purge embeddings for a student, then rebuild (ADMIN). */
export async function adminPurgeAndReindex(studentId: number) {
    const res = await api.post<{ studentId: number; deleted: number; reindexed: number }>(
        '/admin/ai/purge-and-reindex',
        null,
        { params: { studentId } }
    );
    return res.data;
}
