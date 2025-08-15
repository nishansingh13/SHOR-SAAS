import express from 'express';
import { createTemplate, getTemplates, getTemplateById, updateTemplate, deleteTemplate } from '../controllers/templateControllers.js';

const router = express.Router();

router.get('/templates', getTemplates);
router.get('/templates/:id', getTemplateById);
router.post('/templates', createTemplate);
router.put('/templates/:id', updateTemplate);
router.delete('/templates/:id', deleteTemplate);

export default router;
