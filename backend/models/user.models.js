import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'organizer'],
    default: 'organizer',
    required: true,
  },
}, { timestamps: true });

const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
export default UserModel;
