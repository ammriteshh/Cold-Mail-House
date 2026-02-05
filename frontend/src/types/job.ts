export type JobStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface Job {
    id: number;
    recipient: string;
    subject: string;
    body: string;
    senderId: string;
    status: JobStatus;
    scheduledAt: string;
    sentAt?: string | null;
    createdAt: string;
}

export interface CreateJobDto {
    recipient: string;
    subject: string;
    body: string;
    senderId: string;
    scheduledAt?: string;
}
