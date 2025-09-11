import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { purgeAndReindex, reindexStudentEmbeddings } from '../api/AiApi';

const AdminAiTools: React.FC = () => {
    const [studentId, setStudentId] = useState<string>('');
    const [busy, setBusy] = useState(false);
    const [log, setLog] = useState<string>('');
    const navigate = useNavigate();

    const run = async (fn: () => Promise<any>) => {
        if (!studentId) return;
        setBusy(true);
        setLog('');
        try {
            const res = await fn();
            setLog(JSON.stringify(res, null, 2));
        } catch (e: any) {
            console.error(e);
            setLog(e?.response?.data?.message || 'Operation failed');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 px-6 py-10">
            <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow rounded p-6 border border-blue-200 dark:border-blue-500">
                {/* Top Bar with Back Button */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Admin • AI Maintenance</h1>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-3 py-1 text-sm rounded border bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    >
                        ← Back
                    </button>
                </div>

                <div className="flex gap-2 mb-4">
                    <input
                        type="number"
                        value={studentId}
                        onChange={e => setStudentId(e.target.value)}
                        placeholder="Student ID"
                        className="flex-1 rounded border p-2 dark:bg-gray-700 dark:text-white"
                    />
                    <button
                        disabled={busy || !studentId}
                        onClick={() => run(() => reindexStudentEmbeddings(Number(studentId)))}
                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                        Reindex
                    </button>
                    <button
                        disabled={busy || !studentId}
                        onClick={() => run(() => purgeAndReindex(Number(studentId)))}
                        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                    >
                        Purge + Reindex
                    </button>
                </div>

                <pre className="mt-4 text-sm p-3 rounded bg-gray-50 dark:bg-gray-900/40 text-gray-800 dark:text-gray-200 overflow-auto min-h-[120px]">
{log || 'Results will appear here…'}
        </pre>
            </div>
        </div>
    );
};

export default AdminAiTools;
