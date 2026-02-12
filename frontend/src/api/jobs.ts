import { client } from './client';
import type { CreateJobDto, Job } from '../types/job';

export const scheduleEmail = async (data: CreateJobDto) => {
    return client.post<{ message: string; jobId: number }>('/schedule-email', data);
};

export const getJobs = async () => {
    return client.get<Job[]>('/jobs');
};
export interface JobStats {
    sent: number;
    pending: number;
    failed: number;
    successRate: number;
}

export const getJobStats = async () => {
    const res = await client.get<{ totalSent: number, totalPending: number, totalFailed: number, successRate: number }>('/api/analytics');
    // Map new API response to old interface to keep frontend working
    return {
        data: {
            sent: res.data.totalSent,
            pending: res.data.totalPending,
            failed: res.data.totalFailed,
            successRate: res.data.successRate
        }
    };
};
