import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
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

// Create ticket
router.post('/tickets', authenticateToken, createTicket);

// Get ticket by ID
router.get('/tickets/:id', getTicketById);

// Get ticket by ticket number
router.get('/tickets/number/:ticketNumber', getTicketByNumber);

// Validate and check-in ticket
router.post('/tickets/validate', authenticateToken, validateTicket);

// Get all tickets for an event
router.get('/tickets/event/:eventId', authenticateToken, getEventTickets);

// Get tickets for a participant
router.get('/tickets/participant/:participantId', getParticipantTickets);

// Cancel ticket
router.put('/tickets/:id/cancel', authenticateToken, cancelTicket);

// Get check-in statistics for an event
router.get('/tickets/event/:eventId/stats', authenticateToken, getCheckInStats);

export default router;
