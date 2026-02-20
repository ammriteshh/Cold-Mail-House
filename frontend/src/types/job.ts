export type JobStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface Job {
    id: number;
    recipient: string;
    subject: string;
    body: string;
    status: JobStatus;
    scheduledAt: string;
    sentAt?: string | null;
    failureReason?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateJobDto {
    recipient: string;
    subject: string;
    body: string;
    scheduledAt?: string;
    idempotencyKey?: string;
}
