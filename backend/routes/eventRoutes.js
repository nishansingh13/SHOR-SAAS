import express from 'express';
import { getEvents, saveEvent, updateEventById, deleteEventById, getPublicEvents } from '../controllers/eventControllers.js';
import { verifyUser } from '../middleware/verifyUser.js';
const router = express.Router();

router.get('/events', verifyUser, getEvents);
router.get('/public/events', getPublicEvents);
router.post('/events', verifyUser, saveEvent);
router.put('/events/:id', verifyUser, updateEventById);
router.delete('/events/:id', verifyUser, deleteEventById);

export default router;