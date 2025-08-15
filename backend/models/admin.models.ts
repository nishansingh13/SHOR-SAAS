import mongoose, { Schema } from "mongoose";

export interface Admin extends Document{
    email: string,
    password: string
}

const adminSchema : Schema<Admin> = new Schema<Admin>({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password:{
        type: String,
        required: true
    }
},{timestamps: true})

const AdminModel = (mongoose.models?.Admin as mongoose.Model<Admin>) || mongoose.model('Admin', adminSchema);
export default AdminModel;
export const runtime = "nodejs";
