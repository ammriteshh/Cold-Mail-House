import cron from 'node-cron';
import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';

const ONE_HOUR_MS = 60 * 60 * 1000;
/** Every 5 minutes */
const CRON_SCHEDULE = '*/5 * * * *';

/**
 * Deletes FAILED jobs whose reference time is at least 1 hour in the past.
 * Reference time: COALESCE(scheduledAt, createdAt) — same rule as a typical Mongo $ifNull.
 */
export async function deleteExpiredFailedJobs(): Promise<number> {
    const cutoff = new Date(Date.now() - ONE_HOUR_MS);

    const deleted = await prisma.$executeRaw(
        Prisma.sql`
            DELETE FROM "Job"
            WHERE status = 'FAILED'
              AND COALESCE("scheduledAt", "createdAt") <= ${cutoff}
        `
    );

    return typeof deleted === 'number' ? deleted : 0;
}

async function runCleanup(): Promise<void> {
    try {
        const count = await deleteExpiredFailedJobs();
        console.log(
            `[FailedEmailCleanup] Run complete. Deleted ${count} expired FAILED job(s).`
        );
    } catch (err) {
        console.error('[FailedEmailCleanup] Cleanup run failed:', err);
    }
}

let scheduledTask: ReturnType<typeof cron.schedule> | null = null;

export function startFailedEmailCleanupCron(): void {
    if (scheduledTask) {
        console.warn('[FailedEmailCleanup] Cron already running; skipping duplicate start.');
        return;
    }

    scheduledTask = cron.schedule(CRON_SCHEDULE, () => {
        void runCleanup();
    });

    console.log('[FailedEmailCleanup] Cron registered (every 5 minutes).');

    void runCleanup();
}

export function stopFailedEmailCleanupCron(): void {
    if (scheduledTask) {
        scheduledTask.stop();
        scheduledTask = null;
        console.log('[FailedEmailCleanup] Cron stopped.');
    }
}
