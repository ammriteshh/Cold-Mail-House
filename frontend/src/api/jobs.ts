import { client } from './client';
import type { CreateJobDto, Job } from '../types/job';

export interface JobStats {
    sent: number;
    pending: number;
    failed: number;
    successRate: number;
}

export const scheduleEmail = async (data: CreateJobDto) => {
    return client.post<{ message: string; jobId: number }>('/api/jobs/schedule-email', data);
};

export const getJobs = async () => {
    const res = await client.get<{ status: string; results: number; data: Job[] }>('/api/jobs/jobs');
    // Unwrap backend envelope so callers get res.data as Job[]
    return { data: res.data.data };
};

export const getJobStats = async () => {
    const res = await client.get<{ totalSent: number, totalPending: number, totalFailed: number, successRate: number }>('/api/analytics');

    return {
        data: {
            sent: res.data.totalSent,
            pending: res.data.totalPending,
            failed: res.data.totalFailed,
            successRate: res.data.successRate
        }
    };
};
