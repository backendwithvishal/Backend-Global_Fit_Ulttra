// EventLog model for security audits, conversion tracking, and usage analytics
import mongoose from 'mongoose';

const { Schema } = mongoose;

const eventLogSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        index: true,
    },
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: false,
        index: true,
    },
    action: {
        type: String,
        required: true,
        index: true,
    },
    details: {
        type: Schema.Types.Mixed,
        default: {},
    },
    ipAddress: {
        type: String,
    },
    userAgent: {
        type: String,
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true,
    },
}, {
    collection: 'eventlogs',
});

// Compound indexes for analytics queries
eventLogSchema.index({ organizationId: 1, action: 1, timestamp: -1 });
eventLogSchema.index({ userId: 1, action: 1, timestamp: -1 });

export const EventLog = mongoose.model('EventLog', eventLogSchema);

export default EventLog;
