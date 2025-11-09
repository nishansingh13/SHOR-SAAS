import express from 'express';
import { 
  generateCertificate,
  getCertificatesByEvent,
  getAllCertificates,
  verifyCertificate,
  downloadCertificate,
  sendCertificateEmail
} from '../controllers/certificateControllers.js';
import { verifyUser } from '../middleware/verifyUser.js';

const router = express.Router();

router.post('/certificates/generate', verifyUser, generateCertificate);

router.get('/certificates', verifyUser, getAllCertificates);
router.get('/certificates/event/:eventId', verifyUser, getCertificatesByEvent);

router.get('/certificates/verify/:certificateNumber', verifyUser, verifyCertificate);

router.get('/certificates/:id/download', verifyUser, downloadCertificate);

router.post('/certificates/:id/send-email', verifyUser, sendCertificateEmail);

export default router;
