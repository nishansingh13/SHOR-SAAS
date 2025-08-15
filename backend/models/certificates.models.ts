import mongoose, { Document, Schema } from "mongoose";

export interface CertificateInterface extends Document {
    type : string,
    description : string,
    eventName: string
}

const certificateSchema : Schema<CertificateInterface> = new Schema<CertificateInterface>({
    type: {
        type : String,
        required : true,
        enum : ['volunteer', 'participants', 'donation'],
    },
    description: {
        type: String,
        required: true,
    },
    eventName: {
        type: String,
        default: ""
    }
}, {timestamps: true});

const CertificateModal = mongoose.models?.Certificate as mongoose.Model<CertificateInterface> || mongoose.model('Certificate', certificateSchema);

export default CertificateModal;
export const runtime = "nodejs";