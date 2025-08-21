import express from 'express';
import { requestRegistrationFromAdmin } from '../controllers/organiserRequestController.js';
const router = express.Router();
router.post('/request-registration', requestRegistrationFromAdmin);
export default router;