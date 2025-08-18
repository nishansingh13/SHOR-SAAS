import express from 'express';
import { createTemplate, getTemplates, getTemplateById, updateTemplate, deleteTemplate } from '../controllers/templateControllers.js';
import { verifyUser } from '../middleware/verifyUser.js';

const router = express.Router();

router.get('/templates', verifyUser, getTemplates);
router.get('/templates/:id', verifyUser, getTemplateById);
router.post('/templates', verifyUser, createTemplate);
router.put('/templates/:id', verifyUser, updateTemplate);
router.delete('/templates/:id', verifyUser, deleteTemplate);

export default router;
