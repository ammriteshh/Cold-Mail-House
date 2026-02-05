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
