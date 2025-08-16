import express from 'express';
import { createParticipation, getParticipantsByEvent, getAllParticipants, getParticipantById } from '../controllers/participantControllers.js';
import { fillCertificateInfo } from '../controllers/certificateControllers.js';

const router = express.Router();

router.post('/participations', createParticipation);
router.put('/participants/certificate',fillCertificateInfo)
router.get('/participants/getById/:id', getParticipantById);
router.get('/events/:eventId/participants', getParticipantsByEvent);
router.get('/participants/all', getAllParticipants); // New endpoint to fetch all participants

export default router;
