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
    //   createdAt: {
    //     type: Date,
    //     default: Date.now
    //   },
    //   updatedAt: {
    //     type: Date,
    //     default: Date.now
    //   }
});
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
