import mongoose from "mongoose";

const organizerRequestSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    
    organizationName: {
        type: String,
        required: true
    },
    organizationType: {
        type: String,
        enum: ['company', 'startup', 'educational_institution', 'ngo', 'government', 'freelancer', 'other'],
        required: true
    },
    website: String,
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    
    bankName: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    ifscCode: {
        type: String,
        required: true
    },
    accountHolderName: {
        type: String,
        required: true
    },
    
    panCard: {
        type: String,
        required: true
    },
    gstCertificate: String,
    bankStatement: {
        type: String,
        required: true
    },
    organizationLicense: String,
    
    previousExperience: {
        type: String,
        required: true
    },
    expectedEventsPerYear: {
        type: String,
        required: true
    },
    reasonForJoining: {
        type: String,
        required: true
    },
    
    status: {
        type: String,
        enum: ['pending', 'under_review', 'approved', 'rejected'],
        default: 'pending'
    },
    rejectionReason: String,
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: Date,
    approvedAt: Date,
    
    generatedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    generatedPassword: String,
    
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

organizerRequestSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const OrganizerRequest = mongoose.model('OrganizerRequest', organizerRequestSchema);
export default OrganizerRequest;
