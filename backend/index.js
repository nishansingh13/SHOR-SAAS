import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './connectDB.js';
import eventRoutes from './routes/eventRoutes.js';
import authRoutes from './routes/authRoutes.js';
import participantRoutes from './routes/participantRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import sendMail from './mailingSystem/sendMail.js';
import emailRoutes from './routes/emailRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import createOrder from './paymentIntegration/createOrder.js';
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
dotenv.config();
connectDB();
    
// Warn early if JWT secret is missing
if (!process.env.JWT_SECRET) {
    console.warn('[startup] JWT_SECRET is not set. Authenticated routes will fail. Set JWT_SECRET in your .env and restart the server.');
}


app.use('/api', eventRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', participantRoutes);
app.use('/api', templateRoutes);
app.use('/api', certificateRoutes);
app.use('/api/mail',sendMail);
app.use('/api/emails', emailRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders',createOrder);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});