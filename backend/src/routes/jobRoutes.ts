import { Router } from 'express';
import { scheduleEmail, getJobs, getPendingJobs } from '../controllers/jobController';

const router = Router();

router.post('/schedule-email', scheduleEmail);
router.get('/jobs', getJobs);
router.get('/debug/pending', getPendingJobs);

export default router;
