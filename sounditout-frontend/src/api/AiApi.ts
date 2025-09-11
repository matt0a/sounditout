import api from '../api/axios';

export interface StudyTask {
    day: 'Mon'|'Tue'|'Wed'|'Thu'|'Fri'|'Sat'|'Sun'|string;
    title: string;
    steps: string[];
}

export interface StudyPlanDto {
    id: number;
    studentId: number;
    weekStart: string;   // ISO date
    goals: string;
    tasks: StudyTask[];  // coming straight from backend jsonb
}

/** GET /api/ai/study-plan?goal=...  (student’s own ID taken from token on backend) */
export async function generateWeeklyPlan(goal: string) {
    const { data } = await api.get<StudyPlanDto>('/ai/study-plan', { params: { goal } });
    return data;
}

/** GET /api/ai/search?query=...&k=...  (student-scoped) */
export async function searchTopK(query: string, k = 5) {
    const { data } = await api.get('/ai/search', { params: { query, k } });
    return data as {
        studentId: number;
        query: string;
        k: number;
        results: Array<{
            id: number;
            student_id: number;
            report_id: number;
            subject: string | null;
            content: string;
            created_at: string;
        }>
    };
}

/** POST /api/admin/ai/reindex */
export async function reindexStudentEmbeddings(studentId: number) {
    const { data } = await api.post('/admin/ai/reindex', null, { params: { studentId } });
    return data as { studentId: number; reindexed: number };
}

/** POST /api/admin/ai/purge-and-reindex */
export async function purgeAndReindex(studentId: number) {
    const { data } = await api.post('/admin/ai/purge-and-reindex', null, { params: { studentId } });
    return data as { studentId: number; deleted: number; reindexed: number };
}
