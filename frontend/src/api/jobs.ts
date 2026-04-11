import { client } from './client';
import type { CreateJobDto, Job } from '../types/job';

export const scheduleEmail = async (data: CreateJobDto) => {
    return client.post<{ message: string; jobId: number }>('/api/jobs/schedule-email', data);
};

export const getJobs = async () => {
    const res = await client.get<{ status: string; results: number; data: Job[] }>('/api/jobs/jobs');
    // Unwrap backend envelope so callers get res.data as Job[]
    return { data: res.data.data };
};
