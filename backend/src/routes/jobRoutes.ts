import { Router } from 'express';
import { scheduleEmail, getJobs } from '../controllers/jobController';

const router = Router();

router.post('/schedule-email', scheduleEmail);
router.get('/jobs', getJobs);

export default router;
