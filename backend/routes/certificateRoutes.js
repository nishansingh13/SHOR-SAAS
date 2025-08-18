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

// Certificate generation
router.post('/certificates/generate', verifyUser, generateCertificate);

// Get certificates
router.get('/certificates', verifyUser, getAllCertificates);
router.get('/certificates/event/:eventId', verifyUser, getCertificatesByEvent);

// Verify certificate
router.get('/certificates/verify/:certificateNumber', verifyUser, verifyCertificate);

// Download certificate
router.get('/certificates/:id/download', verifyUser, downloadCertificate);

// Send certificate via email
router.post('/certificates/:id/send-email', verifyUser, sendCertificateEmail);

export default router;
