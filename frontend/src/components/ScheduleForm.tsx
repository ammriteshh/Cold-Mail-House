import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { scheduleEmail } from '../api/jobs';
import type { CreateJobDto } from '../types/job';

const ScheduleForm: React.FC = () => {
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
            setMsg({ type: 'error', text: 'Failed to schedule email.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-bold mb-4">Schedule Email</h2>

            {msg && (
                <div className={`p-3 mb-4 rounded ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {msg.text}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Recipient</label>
                        <input
                            {...register('recipient', { required: true })}
                            type="email"
                            placeholder="user@example.com"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                        />
                        {errors.recipient && <span className="text-red-500 text-xs">Required</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Sender ID</label>
                        <input
                            {...register('senderId', { required: true })}
                            placeholder="sender_01"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                        />
                        {errors.senderId && <span className="text-red-500 text-xs">Required</span>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <input
                        {...register('subject', { required: true })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                    />
                    {errors.subject && <span className="text-red-500 text-xs">Required</span>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Body</label>
                    <textarea
                        {...register('body', { required: true })}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                    />
                    {errors.body && <span className="text-red-500 text-xs">Required</span>}
                </div>



                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {loading ? 'Sending...' : 'Send'}
                </button>
            </form>
        </div>
    );
};

export default ScheduleForm;
