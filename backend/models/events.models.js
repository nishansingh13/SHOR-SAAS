import mongoose from 'mongoose';

const { Schema } = mongoose;

const ticketSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const eventSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, 'Please enter a title for this event'],
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'Please enter a description for this event'],
    },
    image: {
      type: String,
      required: [true, 'Please enter a image for this event'],
    },
    date: {
      type: Date,
      required: [true, 'Please enter a date for this event'],
    },
    venue: {
      type: String,
      required: [true, 'Please enter a venue for this event'],
    },
    time: {
      type: String,
      trim: true,
      required: [true, 'Please enter a time for this event'],
    },
    ticket: [
      {
        type: ticketSchema,
        required: true,
      },
    ],
    volunteerCount: {
      type: Number,
      required: true,
    },
    volunteersApplied: {
      type: Number,
      default: 0,
    },
    isTshirtAvailable: {
      type: Boolean,
      required: true,
      default: true,
    },
     organiserId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
  },
  { timestamps: true }
);

const EventModel = mongoose.models.Event || mongoose.model('Event', eventSchema);
export default EventModel;
