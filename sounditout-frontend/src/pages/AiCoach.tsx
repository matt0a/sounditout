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
    tasks?: Task[] | string | any;
    tasksJson?: string;
    [k: string]: any;
};

function normalizeTasks(plan: StudyPlanResponse | null): Task[] {
    if (!plan) return [];

    const direct = (plan as any).tasks;
    if (Array.isArray(direct)) return direct;

    if (typeof direct === 'string') {
        try {
            const parsed = JSON.parse(direct);
            if (Array.isArray(parsed)) return parsed;
            if (parsed && Array.isArray(parsed.tasks)) return parsed.tasks;
        } catch {}
    }

    const tj = (plan as any).tasksJson;
    if (typeof tj === 'string') {
        try {
            const parsed = JSON.parse(tj);
            if (Array.isArray(parsed)) return parsed;
            if (parsed && Array.isArray(parsed.tasks)) return parsed.tasks;
        } catch {}
    }

    if (direct && typeof direct === 'object' && Array.isArray(direct.tasks)) {
        return direct.tasks;
    }

    if ((plan as any).tasks && Array.isArray((plan as any).tasks)) {
        return (plan as any).tasks;
    }

    return [];
}

const AiCoach: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [goal, setGoal] = useState('');
    const [plan, setPlan] = useState<StudyPlanResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const tasks = useMemo(() => normalizeTasks(plan), [plan]);

    const generatePlan = async () => {
        setLoading(true);
        setError(null);
        setPlan(null);
        try {
            const res = await api.get<StudyPlanResponse>('/ai/study-plan', {
                params: { goal },
            });
            setPlan(res.data);
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
                {/* Top Bar with Back Button */}
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
                    <div className="mb-4 rounded border border-red-300 bg-red-50 text-red-700 p-3">
                        {error}
                    </div>
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
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                No tasks array was returned.
                            </div>
                        )}

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
