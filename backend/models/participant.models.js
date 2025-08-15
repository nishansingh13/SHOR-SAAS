import mongoose from 'mongoose';

const { Schema } = mongoose;

const participantSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    eventTitle: { type: String, required: true },
    ticketName: { type: String, required: true },
    ticketPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    amount: { type: Number, required: true },
    isVolunteer: { type: Boolean, default: false },
    tshirtSize: { type: String, enum: ['XS','S','M','L','XL','XXL', null], default: null },
  },
  { timestamps: true }
);

const ParticipantModel = mongoose.models.Participant || mongoose.model('Participant', participantSchema);
export default ParticipantModel;
