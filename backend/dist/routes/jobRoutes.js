"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jobController_1 = require("../controllers/jobController");
const router = (0, express_1.Router)();
router.post('/schedule-email', jobController_1.scheduleEmail);
router.get('/jobs', jobController_1.getJobs);
exports.default = router;
