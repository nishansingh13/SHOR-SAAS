import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { apiLimiter, validationLimiter, createLimiter } from '../middleware/rateLimiter.js';
import {
  createTicket,
  getTicketById,
  getTicketByNumber,
  validateTicket,
  getEventTickets,
  getParticipantTickets,
  cancelTicket,
  getCheckInStats,
} from '../controllers/ticketControllers.js';

const router = express.Router();

// Create ticket (rate limited)
router.post('/tickets', authenticateToken, createLimiter, createTicket);

// Get ticket by ID (rate limited)
router.get('/tickets/:id', apiLimiter, getTicketById);

// Get ticket by ticket number (rate limited)
router.get('/tickets/number/:ticketNumber', apiLimiter, getTicketByNumber);

// Validate and check-in ticket (special validation rate limit)
router.post('/tickets/validate', authenticateToken, validationLimiter, validateTicket);

// Get all tickets for an event (rate limited)
router.get('/tickets/event/:eventId', authenticateToken, apiLimiter, getEventTickets);

// Get tickets for a participant (rate limited)
router.get('/tickets/participant/:participantId', apiLimiter, getParticipantTickets);

// Cancel ticket (rate limited)
router.put('/tickets/:id/cancel', authenticateToken, apiLimiter, cancelTicket);

// Get check-in statistics for an event (rate limited)
router.get('/tickets/event/:eventId/stats', authenticateToken, apiLimiter, getCheckInStats);

export default router;
