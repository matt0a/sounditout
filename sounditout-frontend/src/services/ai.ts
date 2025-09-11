// src/services/ai.ts
import api from '../api/axios';
import { StudyPlan, StudyPlanDTO, SearchResponse } from '../types/ai';

export const AiService = {
    /**
     * Ask the server to generate a weekly plan for the **current user**.
     * Backend reads the student id from the JWT, so no id param here.
     */
    generateStudyPlan: async (goal: string) => {
        const res = await api.get<StudyPlan>('/ai/study-plan', { params: { goal } });
        return res.data;
    },

    /**
     * Upsert embeddings for a specific progress report (current user).
     */
    upsertReportEmbedding: async (reportId: number, payload: { subject?: string; content: string }) => {
        await api.post(`/ai/reports/${reportId}/embed`, payload);
    },

    /**
     * Vector search (RAG) over the current user's prior reports.
     */
    search: async (query: string, k = 5) => {
        const res = await api.get<SearchResponse>('/ai/search', { params: { query, k } });
        return res.data;
    },

    // ----------------- Admin-only maintenance -----------------

    /** Rebuild embeddings for a student (admin). */
    reindexAllForStudent: async (studentId: number) => {
        const res = await api.post<{ studentId: number; reindexed: number }>('/admin/ai/reindex', null, {
            params: { studentId },
        });
        return res.data;
    },

    /** Purge & rebuild embeddings for a student (admin). */
    purgeAndReindexForStudent: async (studentId: number) => {
        const res = await api.post<{ studentId: number; deleted: number; reindexed: number }>(
            '/admin/ai/purge-and-reindex',
            null,
            { params: { studentId } }
        );
        return res.data;
    },
};

// Helpful client-side parser for tasks JSON (server stores raw string)
export function parseStudyPlanTasks(plan: StudyPlan): StudyPlanDTO | null {
    try {
        return JSON.parse(plan.tasksJson) as StudyPlanDTO;
    } catch {
        return null;
    }
}
