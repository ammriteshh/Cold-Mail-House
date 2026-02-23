import { useEffect, useState } from 'react';
import { getJobs } from '../../api/jobs';
import type { Job } from '../../types/job';
import { motion } from 'framer-motion';
import StatusBadge from '../StatusBadge';

const ScheduledTable: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchJobs = async () => {
        try {
            const res = await getJobs();
            setJobs(res.data);
        } catch (error) {
            console.error("Failed to fetch jobs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
        const interval = setInterval(fetchJobs, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Jobs</h3>

            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Recipient</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>

                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                        {jobs.map((job) => (
                            <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-slate-900 dark:text-white">{job.recipient}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-slate-600 dark:text-slate-300 max-w-xs truncate">{job.subject}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={job.status} />
                                    {job.status === 'FAILED' && job.failureReason && (
                                        <div
                                            className={`mt-1 text-xs max-w-xs break-words px-2 py-1 rounded ${job.failureReason.toLowerCase().includes('free plan')
                                                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                                    : 'text-red-400'
                                                }`}
                                            title={job.failureReason}
                                        >
                                            {job.failureReason.length > 100 ? job.failureReason.slice(0, 100) + '…' : job.failureReason}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    {new Date(job.scheduledAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </td>

                            </tr>
                        ))}
                        {!loading && jobs.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                                    No scheduled jobs found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default ScheduledTable;
