// Organization model for team/workspace management
import mongoose from 'mongoose';

const { Schema } = mongoose;

const memberSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    role: {
        type: String,
        enum: ['Owner', 'Admin', 'Manager', 'Member', 'Guest'],
        default: 'Member',
    },
    joinedAt: {
        type: Date,
        default: Date.now,
    }
}, { _id: false });

const organizationSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    members: [memberSchema],
    metadata: {
        type: Schema.Types.Mixed,
        default: {},
    },
}, {
    timestamps: true,
    collection: 'organizations',
});

export const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;
