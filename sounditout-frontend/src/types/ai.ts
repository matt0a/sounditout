// src/types/ai.ts

export type StudyTask = {
    day: string;             // "Mon" | "Tue" | ...
    title: string;
    steps: string[];
};

export type StudyPlanDTO = {
    id: number;
    studentId: number;
    weekStart: string;       // ISO date from backend
    goals: string;
    // tasks comes back as JSONB; could be either the array itself,
    // or an object like { week_start, goals, tasks: [...] }
    tasks: unknown;
};


export type StudyPlan = {
    id: number;
    studentId: number;
    weekStart: string; // ISO date
    goals: string;
    tasksJson: string; // raw JSON stored in DB
    createdAt?: string;
};

export type SearchResultRow = {
    id: number;
    student_id: number;
    report_id: number;
    subject: string;
    content: string;
    created_at: string;
};

export type SearchResponse = {
    studentId: number;
    query: string;
    k: number;
    results: SearchResultRow[];
};
