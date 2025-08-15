import express from 'express';
import { 
  generateCertificate,
  getCertificatesByEvent,
  getAllCertificates,
  verifyCertificate,
  downloadCertificate,
  sendCertificateEmail
} from '../controllers/certificateControllers.js';

const router = express.Router();

// Certificate generation
router.post('/certificates/generate', generateCertificate);

// Get certificates
router.get('/certificates', getAllCertificates);
router.get('/certificates/event/:eventId', getCertificatesByEvent);

// Verify certificate
router.get('/certificates/verify/:certificateNumber', verifyCertificate);

// Download certificate
router.get('/certificates/:id/download', downloadCertificate);

// Send certificate via email
router.post('/certificates/:id/send-email', sendCertificateEmail);

export default router;
