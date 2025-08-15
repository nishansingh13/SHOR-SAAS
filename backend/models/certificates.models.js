import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
    participantId: {
        type: String,
        required: true,
        ref: 'Participant'
    },
    eventId: {
        type: String,
        required: true,
        ref: 'Event'
    },
    templateId: {
        type: String,
        ref: 'Template'
    },
    certificateNumber: {
        type: String,
        required: true,
        unique: true
    },
    generatedAt: {
        type: Date,
        default: Date.now
    },
    downloadUrl: {
        type: String
    },
    emailSent: {
        type: Boolean,
        default: false
    },
    emailSentAt: {
        type: Date
    },
    // Keep the old fields for backward compatibility
    type: {
        type: String,
        enum: ['volunteer', 'participants', 'donation']
    },
    description: {
        type: String
    },
    eventName: {
        type: String
    }
}, {timestamps: true});

const CertificateModel = mongoose.models?.Certificate || mongoose.model('Certificate', certificateSchema);

export default CertificateModel;
