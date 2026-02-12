import axios from 'axios';
import type { CreateJobDto, Job } from '../types/job';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: API_URL,
});

export const scheduleEmail = async (data: CreateJobDto) => {
    return api.post<{ message: string; jobId: number }>('/schedule-email', data);
};

export const getJobs = async () => {
    return api.get<Job[]>('/jobs');
};
export interface JobStats {
    sent: number;
    pending: number;
    failed: number;
    successRate: number;
}

export const getJobStats = async () => {
    const res = await api.get<{ totalSent: number, totalPending: number, totalFailed: number, successRate: number }>('/api/analytics');
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
