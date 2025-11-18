import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    required: true,
    unique: true,
  },
  qrCode: {
    type: String,
    required: true,
  },
  participant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant',
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  ticketType: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['valid', 'used', 'cancelled', 'expired'],
    default: 'valid',
  },
  checkInTime: {
    type: Date,
  },
  checkInBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  checkInLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
  isTransferable: {
    type: Boolean,
    default: false,
  },
  transferHistory: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participant',
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participant',
    },
    transferredAt: {
      type: Date,
      default: Date.now,
    },
  }],
  pdfUrl: {
    type: String,
  },
  emailSent: {
    type: Boolean,
    default: false,
  },
  emailSentAt: {
    type: Date,
  },
}, { timestamps: true });

// Generate unique ticket number
ticketSchema.pre('save', async function(next) {
  if (!this.ticketNumber) {
    const date = new Date();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.ticketNumber = `TKT-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${random}`;
  }
  next();
});

const TicketModel = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
export default TicketModel;
