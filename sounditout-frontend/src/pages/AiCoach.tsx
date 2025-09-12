import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

type Task = { day: string; title: string; steps?: string[]; };

type YouTubeVideo = {
    title: string;
    url: string;
    channelTitle?: string;
    description?: string;
    publishedAt?: string;
    thumbnailUrl?: string;
};

type StudyPlanResponse = {
    id?: number;
    weekStart?: string;
    goals?: string;
    tasks?: Task[] | string | any;
    tasksJson?: string;
    [k: string]: any;
};

function safeParse<T = any>(maybeJson: unknown): T | null {
    if (typeof maybeJson !== 'string') return null;
    try { return JSON.parse(maybeJson) as T; } catch { return null; }
}

function normalizeTasks(plan: StudyPlanResponse | null): Task[] {
    if (!plan) return [];
    const direct = (plan as any).tasks;
    if (Array.isArray(direct)) return direct;
    const fromTasksStr = safeParse<any>(direct);
    if (fromTasksStr) {
        if (Array.isArray(fromTasksStr)) return fromTasksStr as Task[];
        if (Array.isArray(fromTasksStr.tasks)) return fromTasksStr.tasks as Task[];
    }
    const fromTasksJson = safeParse<any>((plan as any).tasksJson);
    if (fromTasksJson) {
        if (Array.isArray(fromTasksJson)) return fromTasksJson as Task[];
        if (Array.isArray(fromTasksJson.tasks)) return fromTasksJson.tasks as Task[];
    }
    // final fallback: if tasks is an object with tasks[]
    if (direct && typeof direct === 'object' && Array.isArray(direct.tasks)) return direct.tasks;
    return [];
}

const AiCoach: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [goal, setGoal] = useState('');
    const [plan, setPlan] = useState<StudyPlanResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [resources, setResources] = useState<YouTubeVideo[]>([]);
    const [loadingResources, setLoadingResources] = useState(false);

    const navigate = useNavigate();
    const tasks = useMemo(() => normalizeTasks(plan), [plan]);

    const fetchResources = async (topic: string) => {
        setLoadingResources(true);
        try {
            const r = await api.get<YouTubeVideo[]>('/ai/study-plan/resources', { params: { topic, max: 6 }});
            setResources(r.data || []);
        } catch (e) {
            console.warn('Resources fetch failed', e);
            setResources([]);
        } finally {
            setLoadingResources(false);
        }
    };

    const generatePlan = async () => {
        setLoading(true);
        setError(null);
        setPlan(null);
        setResources([]);
        try {
            const res = await api.get<StudyPlanResponse>('/ai/study-plan', { params: { goal } });
            setPlan(res.data);
            // fire-and-forget resources search
            fetchResources(goal);
        } catch (e: any) {
            console.error(e);
            setError(e?.response?.data?.message || 'Failed to generate plan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
            <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow">
                {/* Top Bar */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">AI Coach</h1>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-3 py-1 text-sm rounded border bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    >
                        ← Back
                    </button>
                </div>

                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="e.g., Raise reading fluency and decoding this week"
                        className="flex-1 border rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                    />
                    <button
                        onClick={generatePlan}
                        disabled={loading || !goal.trim()}
                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                        {loading ? 'Generating…' : 'Generate Plan'}
                    </button>
                </div>

                {error && (
                    <div className="mb-4 rounded border border-red-300 bg-red-50 text-red-700 p-3">{error}</div>
                )}

                {plan && (
                    <>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                <span className="font-semibold">Week start:</span> {plan.weekStart || '(server computed)'}
                            </p>
                            {plan.goals && (
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    <span className="font-semibold">Goal:</span> {plan.goals}
                                </p>
                            )}
                        </div>

                        {tasks.length > 0 ? (
                            <div className="space-y-3">
                                {tasks.map((t, idx) => (
                                    <div key={idx} className="border rounded p-3 dark:border-gray-700">
                                        <div className="font-semibold text-gray-800 dark:text-gray-100">
                                            {t.day}: {t.title}
                                        </div>
                                        {t.steps && t.steps.length > 0 && (
                                            <ul className="list-disc ml-5 mt-2 text-sm text-gray-700 dark:text-gray-200">
                                                {t.steps.map((s, i) => (
                                                    <li key={i}>{s}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-600 dark:text-gray-300">No tasks were returned.</div>
                        )}

                        {/* Collapsible Resources */}
                        <details className="mt-6 group" open={resources.length > 0}>
                            <summary className="cursor-pointer select-none text-sm text-gray-700 dark:text-gray-200 font-medium flex items-center gap-2">
                                <span className="inline-block transition-transform group-open:rotate-90">›</span>
                                Helpful videos & articles
                                {loadingResources ? ' (loading…)'
                                    : resources.length > 0 ? ` (${resources.length})` : ''}
                            </summary>

                            {resources.length > 0 ? (
                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                    {resources.map((v, i) => (
                                        <a
                                            key={`${v.url}-${i}`}
                                            href={v.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex gap-3 border rounded p-3 hover:shadow-sm transition bg-white dark:bg-gray-800 dark:border-gray-700"
                                        >
                                            {v.thumbnailUrl ? (
                                                <img
                                                    src={v.thumbnailUrl}
                                                    alt={v.title}
                                                    className="w-28 h-16 object-cover rounded"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-28 h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                                            )}
                                            <div className="min-w-0">
                                                <div className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                                                    {v.title}
                                                </div>
                                                {v.channelTitle && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {v.channelTitle}
                                                    </div>
                                                )}
                                                {v.publishedAt && (
                                                    <div className="text-xs text-gray-400">
                                                        {new Date(v.publishedAt).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                !loadingResources && (
                                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                        No resources were returned.
                                    </div>
                                )
                            )}
                        </details>

                        <details className="mt-6">
                            <summary className="cursor-pointer text-sm text-gray-500">Raw response</summary>
                            <pre className="mt-2 text-xs overflow-auto bg-gray-50 dark:bg-gray-900 p-3 rounded">
                {JSON.stringify(plan, null, 2)}
              </pre>
                        </details>
                    </>
                )}
            </div>
        </div>
    );
};

export default AiCoach;
