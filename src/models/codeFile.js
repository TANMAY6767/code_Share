import mongoose, { Schema } from "mongoose";

// Define schema
export const codeFileSchema = new Schema({
    filename: {
        type: String,
        required: true,
        trim: true
    },
    language: {
        type: String,
        required: true,
        enum: ['javascript', 'typescript', 'html', 'css', 'python', 'java', 'cpp', 'csharp', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin'],
        default: 'javascript'
    },
    content: {
        type: String,
        required: true,
        default: ''
    },
    shareId: {
        type: String,
        unique: true,
        trim: true,
        index: true
    },
    type: {
        type: String,
        required: true,
        enum: ['editable', 'read-only'],
        default: 'editable'
    },
    expiresIn: {
        type: String,
        enum: ['1m', '1h', '24h', '2d', '3d'], // Updated options
        default: '1h'
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 3600000) // 1 hour from now
    },
    
});

// Middleware to calculate expiresAt based on expiresIn
codeFileSchema.pre('save', function(next) {
  const durationMap = {
    '1m': 60000,       // 1 minute
    '1h': 3600000,     // 1 hour
    '24h': 86400000,   // 24 hours
    '2d': 172800000,   // 2 days (48 hours)
    '3d': 259200000    // 3 days (72 hours)
  };
  
  if (this.isModified('expiresIn') || this.isNew) {
    this.expiresAt = new Date(Date.now() + durationMap[this.expiresIn]);
  }
  next();
});

// TTL index for automatic expiration
codeFileSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

codeFileSchema.statics.generateShareId = async function () {
    const generateId = () => Math.random().toString(36).substring(2, 10);
    let shareId = generateId();
    let exists = await this.findOne({ shareId });

    while (exists) {
        shareId = generateId();
        exists = await this.findOne({ shareId });
    }

    return shareId;
};
// Optional: Create model (for individual access)
export const codeFile = mongoose.models.codeFile || mongoose.model("codeFile", codeFileSchema);
