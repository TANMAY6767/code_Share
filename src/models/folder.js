import mongoose, { Schema } from "mongoose";
import { codeFileSchema } from "./codeFile.js"; // ✅ Import schema

const folderSchema = new Schema(
    {
        shareId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        name: {
            type: String,
            trim: true,
            default: 'Untitled Project'
        },

        files: [{
            type: Schema.Types.ObjectId,
            ref: 'codeFile'
        }],
        // createdAt: {
        //     type: Date,
        //     default: Date.now
        // },
        // updatedAt: {
        //     type: Date,
        //     default: Date.now
        // },
        expiresAt: {
            type: Date,
            index: { expires: 0 }
        },
        // owner: {
        //     type: Schema.Types.ObjectId,
        //     ref: 'User'
        // },
        // isPublic: {
        //     type: Boolean,
        //     default: true
        // }
    },
    {
        timestamps: true
    }
);

folderSchema.pre('save', function (next) {
    if (this.isModified('files')) {
        this.updatedAt = Date.now();
    }
    next();
});

folderSchema.statics.generateShareId = async function () {
    const generateId = () => Math.random().toString(36).substring(2, 10);
    let shareId = generateId();
    let exists = await this.findOne({ shareId });

    while (exists) {
        shareId = generateId();
        exists = await this.findOne({ shareId });
    }

    return shareId;
};

const Folder = mongoose.models.Folder || mongoose.model('Folder', folderSchema);

export default Folder;
