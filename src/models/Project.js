import mongoose, { Schema } from 'mongoose';
import { nanoid } from 'nanoid';

const projectSchema = new Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     default: null,
//   },
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'Untitled Project',
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  // editToken: {
  //   type: String,
  //   required: true,
  //   unique: true,
  //   index: true,
  // },
  type: {
    type: String,
    enum: ['editable', 'read-only'],
    default: 'editable',
  },
  expiresIn: {
    type: String,
    enum: ['1m', '1h', '24h', '2d', '3d'],
    default: '1h',
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 3600000)
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

projectSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

projectSchema.pre('validate', function (next) {
  if (!this.slug) this.slug = nanoid(8);
  // if (!this.editToken) this.editToken = nanoid(32);

  const durationMap = {
    '1m': 60000,
    '1h': 3600000,
    '24h': 86400000,
    '2d': 172800000,
    '3d': 259200000,
  };

  if (!this.expiresAt || this.isModified('expiresIn')) {
    this.expiresAt = new Date(Date.now() + durationMap[this.expiresIn]);
  }

  next();
});

export const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
