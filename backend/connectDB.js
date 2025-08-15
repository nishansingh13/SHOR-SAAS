import mongoose from 'mongoose'
export const connectDB = async(req,res)=>{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        // res.status(500).send("Database connection failed");
    }
}