// src/types/ai.ts

export type StudyTask = {
    day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
    title: string;
    steps: string[];
};

export type StudyPlanDTO = {
    week_start: string; // ISO date
    goals: string;
    tasks: StudyTask[];
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
