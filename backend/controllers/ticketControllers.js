import TicketModel from '../models/ticket.models.js';
import ParticipantModel from '../models/participant.models.js';
import EventModel from '../models/events.models.js';

// Generate QR code data (simple base64 encoded string)
const generateQRCode = (ticketNumber, eventId, participantId) => {
  const data = JSON.stringify({
    ticket: ticketNumber,
    event: eventId,
    participant: participantId,
    timestamp: Date.now(),
  });
  return Buffer.from(data).toString('base64');
};

// Create ticket for participant
export const createTicket = async (req, res) => {
  try {
    const { participantId, eventId, ticketType, price } = req.body;

    const participant = await ParticipantModel.findById(participantId);
    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    const event = await EventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Generate unique ticket number
    const date = new Date();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const ticketNumber = `TKT-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${random}`;

    // Generate QR code
    const qrCode = generateQRCode(ticketNumber, eventId, participantId);

    const ticket = new TicketModel({
      ticketNumber,
      qrCode,
      participant: participantId,
      event: eventId,
      ticketType,
      price,
    });

    await ticket.save();

    // Update participant with ticket reference
    participant.ticketId = ticket._id;
    await participant.save();

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
};

// Get ticket by ID
export const getTicketById = async (req, res) => {
  try {
    const ticket = await TicketModel.findById(req.params.id)
      .populate('participant', 'name email phone')
      .populate('event', 'title date venue time');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
};

// Get ticket by ticket number
export const getTicketByNumber = async (req, res) => {
  try {
    const { ticketNumber } = req.params;
    const ticket = await TicketModel.findOne({ ticketNumber })
      .populate('participant', 'name email phone')
      .populate('event', 'title date venue time eventType');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
};

// Validate and check-in ticket
export const validateTicket = async (req, res) => {
  try {
    const { qrCode, latitude, longitude } = req.body;
    const userId = req.user.id;

    // Decode QR code
    let ticketData;
    try {
      const decoded = Buffer.from(qrCode, 'base64').toString('utf-8');
      ticketData = JSON.parse(decoded);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid QR code' });
    }

    const ticket = await TicketModel.findOne({ ticketNumber: ticketData.ticket })
      .populate('participant', 'name email phone')
      .populate('event', 'title date venue time eventType');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check if ticket is valid
    if (ticket.status !== 'valid') {
      return res.status(400).json({ 
        error: `Ticket is ${ticket.status}`,
        ticket,
      });
    }

    // Check if event date has passed
    const eventDate = new Date(ticket.event.date);
    const currentDate = new Date();
    if (currentDate > eventDate && (currentDate - eventDate) > 24 * 60 * 60 * 1000) {
      ticket.status = 'expired';
      await ticket.save();
      return res.status(400).json({ 
        error: 'Ticket has expired',
        ticket,
      });
    }

    // Mark ticket as used and record check-in
    ticket.status = 'used';
    ticket.checkInTime = new Date();
    ticket.checkInBy = userId;
    if (latitude && longitude) {
      ticket.checkInLocation = { latitude, longitude };
    }

    await ticket.save();

    // Update participant check-in status
    const participant = await ParticipantModel.findById(ticket.participant._id);
    if (participant) {
      participant.checkedIn = true;
      participant.checkInTime = ticket.checkInTime;
      await participant.save();
    }

    res.json({
      success: true,
      message: 'Ticket validated successfully',
      ticket,
    });
  } catch (error) {
    console.error('Error validating ticket:', error);
    res.status(500).json({ error: 'Failed to validate ticket' });
  }
};

// Get all tickets for an event
export const getEventTickets = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status } = req.query;

    const query = { event: eventId };
    if (status) {
      query.status = status;
    }

    const tickets = await TicketModel.find(query)
      .populate('participant', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    console.error('Error fetching event tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};

// Get tickets for a participant
export const getParticipantTickets = async (req, res) => {
  try {
    const { participantId } = req.params;

    const tickets = await TicketModel.find({ participant: participantId })
      .populate('event', 'title date venue time eventType')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    console.error('Error fetching participant tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};

// Cancel ticket
export const cancelTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await TicketModel.findById(id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticket.status === 'used') {
      return res.status(400).json({ error: 'Cannot cancel a used ticket' });
    }

    ticket.status = 'cancelled';
    await ticket.save();

    res.json({
      success: true,
      message: 'Ticket cancelled successfully',
      ticket,
    });
  } catch (error) {
    console.error('Error cancelling ticket:', error);
    res.status(500).json({ error: 'Failed to cancel ticket' });
  }
};

// Get check-in statistics for an event
export const getCheckInStats = async (req, res) => {
  try {
    const { eventId } = req.params;

    const totalTickets = await TicketModel.countDocuments({ event: eventId });
    const checkedInTickets = await TicketModel.countDocuments({ 
      event: eventId, 
      status: 'used' 
    });
    const validTickets = await TicketModel.countDocuments({ 
      event: eventId, 
      status: 'valid' 
    });
    const cancelledTickets = await TicketModel.countDocuments({ 
      event: eventId, 
      status: 'cancelled' 
    });

    // Get hourly check-in data for the last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCheckIns = await TicketModel.find({
      event: eventId,
      status: 'used',
      checkInTime: { $gte: last24Hours },
    }).select('checkInTime');

    // Group by hour
    const hourlyData = {};
    recentCheckIns.forEach(ticket => {
      const hour = new Date(ticket.checkInTime).getHours();
      hourlyData[hour] = (hourlyData[hour] || 0) + 1;
    });

    res.json({
      totalTickets,
      checkedInTickets,
      validTickets,
      cancelledTickets,
      checkInRate: totalTickets > 0 ? ((checkedInTickets / totalTickets) * 100).toFixed(2) : 0,
      hourlyCheckIns: hourlyData,
    });
  } catch (error) {
    console.error('Error fetching check-in stats:', error);
    res.status(500).json({ error: 'Failed to fetch check-in statistics' });
  }
};
