// src/utils/ai.ts
import { StudyTask } from '../types/ai';

export function extractTasks(tasksJson: unknown): StudyTask[] {
    // case A: backend stored the whole object with { tasks: [...] }
    if (tasksJson && typeof tasksJson === 'object' && !Array.isArray(tasksJson)) {
        const obj = tasksJson as Record<string, unknown>;
        const inner = obj['tasks'];
        if (Array.isArray(inner)) {
            return inner as StudyTask[];
        }
    }
    // case B: backend stored just an array
    if (Array.isArray(tasksJson)) {
        return tasksJson as StudyTask[];
    }
    // fallback
    return [];
}
