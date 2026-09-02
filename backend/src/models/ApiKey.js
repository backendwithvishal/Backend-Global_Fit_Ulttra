// ApiKey model for developer integrations and public API access
import mongoose from 'mongoose';

const { Schema } = mongoose;

const apiKeySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true,
    },
    keyHash: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    prefix: {
        type: String,
        required: true,
    },
    scopes: {
        type: [String],
        default: ['read:financial'],
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
    lastUsedAt: {
        type: Date,
        default: null,
    },
    expiresAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
    collection: 'apikeys',
});

export const ApiKey = mongoose.model('ApiKey', apiKeySchema);

export default ApiKey;
