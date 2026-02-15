import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { scheduleEmail } from '../../api/jobs';
import type { CreateJobDto } from '../../types/job';
import { Send, Calendar, User, Type, AlignLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const EmailComposer: React.FC = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateJobDto>();
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const onSubmit = async (data: CreateJobDto) => {
        setLoading(true);
        setMsg(null);
        try {
            await scheduleEmail(data);
            setMsg({ type: 'success', text: 'Email scheduled successfully!' });
            reset();
        } catch (err) {
            console.error("Schedule Error:", err);
            setMsg({ type: 'error', text: 'Failed to schedule email. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Send className="h-5 w-5 text-indigo-500" />
                    Internal Email Composer
                </h2>
            </div>

            <div className="p-6">
                {msg && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className={`p-3 mb-6 rounded-lg text-sm font-medium ${msg.type === 'success'
                            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                            }`}
                    >
                        {msg.text}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Recipient</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <input
                                    {...register('recipient', { required: true })}
                                    type="email"
                                    placeholder="user@example.com"
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            {errors.recipient && <span className="text-red-500 text-xs">Required</span>}
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Sender ID</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <input
                                    {...register('senderId', { required: true })}
                                    placeholder="sender_01"
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            {errors.senderId && <span className="text-red-500 text-xs">Required</span>}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Subject</label>
                        <div className="relative">
                            <Type className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                                {...register('subject', { required: true })}
                                placeholder="Meeting Request"
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        {errors.subject && <span className="text-red-500 text-xs">Required</span>}
                    </div>

                    <div className="space-y-1">
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Body</label>
                        <div className="relative">
                            <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <textarea
                                {...register('body', { required: true })}
                                rows={6}
                                placeholder="Hi there..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                            />
                        </div>
                        {errors.body && <span className="text-red-500 text-xs">Required</span>}
                    </div>

                    <div className="space-y-1">
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Schedule (Optional)</label>
                        <div className="relative max-w-xs">
                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                                {...register('scheduledAt')}
                                type="datetime-local"
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-500"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full md:w-auto px-6 py-2.5 rounded-lg text-sm font-medium text-white shadow-lg shadow-indigo-500/30 transition-all
                                ${loading
                                    ? 'bg-indigo-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98]'
                                }
                            `}
                        >
                            {loading ? 'Scheduling...' : 'Schedule Email'}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default EmailComposer;
