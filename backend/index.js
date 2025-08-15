import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './connectDB.js';
import eventRoutes from './routes/eventRoutes.js';
import authRoutes from './routes/authRoutes.js';
import participantRoutes from './routes/participantRoutes.js';
import templateRoutes from './routes/templateRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
dotenv.config();
connectDB();

// Mount all routes
app.use('/api', eventRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', participantRoutes);
app.use('/api', templateRoutes);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 