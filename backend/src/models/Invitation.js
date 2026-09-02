// Invitation model for team membership invitations
import mongoose from 'mongoose';

const { Schema } = mongoose;

const invitationSchema = new Schema({
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    role: {
        type: String,
        enum: ['Admin', 'Manager', 'Member', 'Guest'],
        default: 'Member',
    },
    token: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Expired'],
        default: 'Pending',
        index: true,
    },
    invitedById: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true,
    },
}, {
    timestamps: true,
    collection: 'invitations',
});

// Ensure a user cannot have multiple pending invites to the same organization
invitationSchema.index({ organizationId: 1, email: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'Pending' } });

export const Invitation = mongoose.model('Invitation', invitationSchema);

export default Invitation;
