import mongoose, { Document, Schema } from "mongoose";

export interface DonationInterface extends Document {
    fullName: string,
    email: string,
    phoneNumber: number,
    address: string,
    city: string,
    state: string,
    pincode: number,
    panNumber: string,
    donationAmount: number,
    paymentStatus: string,
    createdAt: Date,
    isCertified: boolean
}

const donationSchema : Schema<DonationInterface> = new Schema({
    fullName: {
        type: String,
        required: [true, "Full name is required"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true
    },
    address: {
        type: String,
        required: [true, "Address is required"],
        trim: true
    },
    city: {
        type: String,
        required: [true, "City is required"],
        trim: true
    },
    state: {
        type: String,
        required: [true, "State is required"],
        trim: true
    },
    pincode: {
        type: Number,
        required: [true, "Pincode is required"],
        trim: true
    },
    phoneNumber: {
        type: Number,
        required: [true, "Phone number is required"],
        trim: true
    },
    panNumber: {
        type: String,
        trim: true
    },
    donationAmount: {
        type: Number,
        required: [true, "Donation amount is required"],
        min: [1, "Donation amount must be positive"]
    },
    paymentStatus:{
        type: String,
        enum: ["PENDING", "COMPLETED", "FAILED"],
        default: "PENDING",
    },
    isCertified: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

const DonationModel = (mongoose.models.Donation as mongoose.Model<DonationInterface>) || mongoose.model<DonationInterface>("Donation", donationSchema);

export default DonationModel;
export const runtime = "nodejs";