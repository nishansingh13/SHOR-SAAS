import mongoose, { Schema } from "mongoose";

export interface ticketInterface{
    name : string,
    price: number,
    _id : Schema.Types.ObjectId
}

export interface Events extends Document{
    title: string,
    description: string,
    image: string,
    date : Date,
    venue: string,
    time: string,
    ticket: [ticketInterface],
    volunteerCount: number,
    volunteersApplied: number,
    participantCount: number, // New field to track total participants registered
    isTshirtAvailable : boolean,
    organiserId: Schema.Types.ObjectId
    status : "active" | "completed" | "pending"
}

const ticketSchema : Schema<ticketInterface> = new Schema<ticketInterface>({
    name: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    price: {
        type: Number,
        required: true,
    }
});

const eventSchema : Schema<Events> = new Schema<Events>({
    title: {
        type: String,
        trim: true,
        required: [true, "Please enter a title for this event"],
        unique: true
    },
    description: {
        type: String,
        trim: true,
        required: [true, "Please enter a description for this event"]
    },
    image: {
        type: String,
        required: [true, "Please enter a image for this event"]
    },
    date: {
        type: Date,
        required: [true, "Please enter a date for this event"]
    },
    venue: {
        type: String,
        required: [true, "Please enter a venue for this event"]
    },
    time: {
        type: String,
        trim: true,
        required: [true, "Please enter a time for this event"]
    },
    ticket: [{
        type: ticketSchema,
        required: true
    }],
    volunteerCount: {
        type: Number,
        required: true,
    },
    volunteersApplied: {
        type: Number,
        default: 0
    },
    participantCount: {
        type: Number,
        default: 0 
    },
    isTshirtAvailable: {
        type: Boolean,
        required: true,
        default: true
    },
    organiserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status : {
        type: String,
        enum: ["active", "completed", "pending"],
        default: "pending"
    }
},{timestamps: true});

const EventModel = (mongoose.models.Event as mongoose.Model<Events>) || mongoose.model<Events>("Event", eventSchema);
export default EventModel;
export const runtime = "nodejs";
