import ParticipantModel from '../models/participant.models.js';
import EventModel from '../models/events.models.js';
import TicketModel from '../models/ticket.models.js';

// Generate QR code data
const generateQRCode = (ticketNumber, eventId, participantId) => {
  const data = JSON.stringify({
    ticket: ticketNumber,
    event: eventId,
    participant: participantId,
    timestamp: Date.now(),
  });
  return Buffer.from(data).toString('base64');
};

export const createParticipation = async (req, res) => {
  try {
    const { eventId, name, email, phone, ticketName, quantity = 1, isVolunteer = false, tshirtSize } = req.body || {};
    if (!eventId || !name || !email || !ticketName) {
      return res.status(400).json({ error: 'eventId, name, email, ticketName are required' });
    }
    const participant = await ParticipantModel.findOne({ email, event: eventId });
    if(participant) return res.status(400).json({ error: 'Participant already exists' });
    const event = await EventModel.findById(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const ticket = (event.ticket || []).find(t => t.name === String(ticketName).toUpperCase());
    if (!ticket) return res.status(400).json({ error: 'Invalid ticket' });

    const qty = Math.max(1, Number(quantity || 1));
    const amount = Number(ticket.price) * qty;

    const doc = await ParticipantModel.create({
      name,
      email: String(email).toLowerCase(),
      phone,
      event: event._id,
      eventTitle: event.title,
      ticketName: ticket.name,
      ticketPrice: ticket.price,
      quantity: qty,
      amount,
      isVolunteer: Boolean(isVolunteer),
      tshirtSize: isVolunteer ? (tshirtSize || null) : null,
    });

    // Create ticket for the participant
    const date = new Date();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const ticketNumber = `TKT-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${random}`;
    const qrCode = generateQRCode(ticketNumber, event._id, doc._id);

    const ticketDoc = await TicketModel.create({
      ticketNumber,
      qrCode,
      participant: doc._id,
      event: event._id,
      ticketType: ticket.name,
      price: ticket.price,
    });

    // Update participant with ticket reference
    doc.ticketId = ticketDoc._id;
    await doc.save();

    if (isVolunteer) {
      await EventModel.findByIdAndUpdate(event._id, { $inc: { volunteersApplied: 1 } });
    } else {
      // Increment total participant count by created quantity
      await EventModel.findByIdAndUpdate(event._id, { $inc: { participantCount: qty } });
    }

    const updatedEvent = await EventModel.findById(event._id).select('participantCount volunteersApplied');

    return res.status(201).json({
      success: true,
      participant: doc,
      ticket: ticketDoc,
      eventStats: updatedEvent
    });
  } catch (err) {
    console.error('createParticipation error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getParticipantsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    // If organizer, enforce access to own events only
    if (req.user?.role === 'organizer') {
      const event = await EventModel.findById(eventId).select('organiserId');
      if (!event) return res.status(404).json({ error: 'Event not found' });
      if (String(event.organiserId) !== String(req.user.userId)) {
        return res.status(403).json({ error: 'Forbidden: Not your event' });
      }
    }
    const list = await ParticipantModel.find({ event: eventId }).sort({ createdAt: -1 });
    return res.json(list);
  } catch (err) {
    console.error('getParticipantsByEvent error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// New function to get all participants regardless of event
export const getAllParticipants = async (req, res) => {
  try {
    // Admins get all participants; organizers only their events
    if (req.user?.role === 'organizer') {
      const events = await EventModel.find({ organiserId: req.user.userId }).select('_id');
      const eventIds = events.map(e => e._id);
      const list = await ParticipantModel.find({ event: { $in: eventIds } }).sort({ createdAt: -1 });
      return res.json(list);
    } else {
      const list = await ParticipantModel.find({}).sort({ createdAt: -1 });
      return res.json(list);
    }
  } catch (err) {
    console.error('getAllParticipants error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getParticipantById = async (req, res) => {
  try {
    const { id } = req.params;
    const participant = await ParticipantModel.findById(id).populate('event', 'organiserId');
    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }
    if (req.user?.role === 'organizer') {
      const organiserId = participant?.event?.organiserId;
      if (organiserId && String(organiserId) !== String(req.user.userId)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
    return res.json(participant);
  } catch (err) {
    console.error('getParticipantById error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Check if participant already exists for an event (to prevent duplicate registrations)
export const checkDuplicateParticipant = async (req, res) => {
  try {
    const { email, eventId } = req.body;
    
    if (!email || !eventId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and eventId are required' 
      });
    }

    const existingParticipant = await ParticipantModel.findOne({ 
      email: String(email).toLowerCase(), 
      event: eventId 
    });

    return res.json({
      success: true,
      exists: !!existingParticipant,
      participant: existingParticipant || null
    });
  } catch (error) {
    console.error('checkDuplicateParticipant error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};
