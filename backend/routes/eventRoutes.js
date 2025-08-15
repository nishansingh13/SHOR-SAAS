import express from 'express';
import { getEvents, saveEvent, updateEventById, deleteEventById } from '../controllers/eventControllers.js';
const router = express.Router();

router.get('/events', getEvents);
router.post('/events', saveEvent);
router.put('/events/:id', updateEventById);
router.delete('/events/:id', deleteEventById);

export default router;