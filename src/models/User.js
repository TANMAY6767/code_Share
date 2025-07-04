import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    default: 'Anonymous',
    trim: true,
  },
  profileImage: {
    type: String,
  },
  provider: {
    type: String,
    enum: ['google', 'github'],
    required: true,
  },
  providerId: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.index({ email: 1 });
userSchema.index({ provider: 1, providerId: 1 }, { unique: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
