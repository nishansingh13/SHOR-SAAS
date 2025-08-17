import express from 'express';
import { updateEmailStatus } from '../controllers/emailControllers.js';
const router = express.Router();

router.put('/status', updateEmailStatus);

export default router;