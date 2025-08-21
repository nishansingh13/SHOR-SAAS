import mongoose from "mongoose";
const requestFromAdminSchema = new mongoose.Schema({
    email : {
        type:String,
        unique:true
    },
    password: {
        type: String,
        required: true
    },
    name :{
        type:String,
        required : true,
    },
    GSTIN: {
        type: String,
        required: true
    },
    status:{
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    }
});

const RequestFromAdmin = mongoose.model("RequestFromAdmin", requestFromAdminSchema);
export default RequestFromAdmin;