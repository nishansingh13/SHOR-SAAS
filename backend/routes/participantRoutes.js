import express from 'express';
import { createParticipation, getParticipantsByEvent, getAllParticipants } from '../controllers/participantControllers.js';

const router = express.Router();

router.post('/participations', createParticipation);
router.get('/events/:eventId/participants', getParticipantsByEvent);
router.get('/participants/all', getAllParticipants); // New endpoint to fetch all participants

export default router;
