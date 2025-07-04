import mongoose, { Schema } from 'mongoose';

const projectNodeSchema = new Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Project',
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProjectNode',
    default: null,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['file', 'folder'],
    required: true,
  },
  content: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

projectNodeSchema.index({ projectId: 1 });
projectNodeSchema.index({ parentId: 1 });

export const ProjectNode = mongoose.models.ProjectNode || mongoose.model('ProjectNode', projectNodeSchema);
