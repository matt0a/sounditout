// src/pages/AiCoach.tsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

type Task = {
    day: string;
    title: string;
    steps?: string[];
};

type StudyPlanResponse = {
    id?: number;
    weekStart?: string;
    goals?: string;
    // The backend may return an array, or an object with { tasks: [...] },
    // or (older data) a JSON string. We normalize it below.
    tasks?: unknown;
    tasksJson?: unknown;
    [k: string]: unknown;
};

/** Normalize whatever comes back (array | {tasks: array} | stringified) into Task[] */
function normalizeTasks(plan: StudyPlanResponse | null): Task[] {
    if (!plan) return [];

    const tryParse = (v: unknown): unknown => {
        if (typeof v === 'string') {
            try {
                return JSON.parse(v);
            } catch {
                return null;
            }
        }
        return v;
    };

    const candidates: unknown[] = [
        plan.tasks,
        plan.tasksJson,
        // sometimes the whole plan is a JSON object stringified (defensive)
        tryParse(plan as unknown as string),
    ];

    for (const cand of candidates) {
        const parsed = tryParse(cand);
        if (Array.isArray(parsed)) return parsed as Task[];
        if (parsed && typeof parsed === 'object' && Array.isArray((parsed as any).tasks)) {
            return (parsed as any).tasks as Task[];
        }
    }

    return [];
}

const AiCoach: React.FC = () => {
    const navigate = useNavigate();

    const [goal, setGoal] = useState('');
    const [plan, setPlan] = useState<StudyPlanResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const tasks = useMemo(() => normalizeTasks(plan), [plan]);

    const generatePlan = async () => {
        if (!goal.trim()) return;
        setLoading(true);
        setError(null);
        setPlan(null);

        try {
            const res = await api.get<StudyPlanResponse>('/ai/study-plan', { params: { goal } });
            setPlan(res.data);
        } catch (e: any) {
            console.error(e);
            setError(e?.response?.data?.message || 'Failed to generate plan. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-6 py-10">
            <div className="mx-auto w-full max-w-4xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                            AI Study Coach
                        </h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                            Generate a tailored one-week plan based on your goal.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                    >
                        ← Back
                    </button>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                    {/* Goal input */}
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                            type="text"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            placeholder="e.g., Improve calculus problem-solving this week"
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        />
                        <button
                            onClick={generatePlan}
                            disabled={loading || !goal.trim()}
                            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? 'Generating…' : 'Generate Plan'}
                        </button>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
                            {error}
                        </div>
                    )}

                    {/* Plan */}
                    {plan && (
                        <div className="mt-6">
                            <div className="mb-4 grid gap-2 sm:grid-cols-3 sm:gap-4">
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-900">
                                    <div className="text-gray-500 dark:text-gray-400">Week Start</div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                        {plan.weekStart || '—'}
                                    </div>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm sm:col-span-2 dark:border-gray-700 dark:bg-gray-900">
                                    <div className="text-gray-500 dark:text-gray-400">Goal</div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                        {plan.goals || goal}
                                    </div>
                                </div>
                            </div>

                            {/* Tasks */}
                            {tasks.length > 0 ? (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {tasks.map((t, idx) => (
                                        <div
                                            key={`${t.day}-${idx}`}
                                            className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                    {t.day}
                                                </div>
                                            </div>
                                            <h3 className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                {t.title}
                                            </h3>
                                            {t.steps && t.steps.length > 0 && (
                                                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-200">
                                                    {t.steps.map((s, i) => (
                                                        <li key={i}>{s}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
                                    No tasks were returned. Try refining your goal (e.g., add timeframe, topic, or level).
                                </div>
                            )}

                            {/* Raw payload (debug toggle) */}
                            <details className="mt-6">
                                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                    Show raw response
                                </summary>
                                <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-gray-50 p-3 text-xs text-gray-800 dark:bg-gray-900 dark:text-gray-200">
{JSON.stringify(plan, null, 2)}
                </pre>
                            </details>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AiCoach;
