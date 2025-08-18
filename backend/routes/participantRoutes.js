import express from 'express';
import { createParticipation, getParticipantsByEvent, getAllParticipants, getParticipantById } from '../controllers/participantControllers.js';
import { fillCertificateInfo } from '../controllers/certificateControllers.js';
import { verifyUser } from '../middleware/verifyUser.js';

const router = express.Router();

router.post('/participations', createParticipation);
router.put('/participants/certificate', verifyUser, fillCertificateInfo)
router.get('/participants/getById/:id', verifyUser, getParticipantById);
router.get('/events/:eventId/participants', verifyUser, getParticipantsByEvent);
router.get('/participants/all', verifyUser, getAllParticipants); 

export default router;
