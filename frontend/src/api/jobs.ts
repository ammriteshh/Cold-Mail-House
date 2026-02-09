import axios from 'axios';
import type { CreateJobDto, Job } from '../types/job';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: API_URL,
});

export const scheduleEmail = async (data: CreateJobDto, token: string | null) => {
    return api.post<{ message: string; jobId: number }>('/schedule-email', data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const getJobs = async (token: string | null) => {
    return api.get<Job[]>('/jobs', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};
