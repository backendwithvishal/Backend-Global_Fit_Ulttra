import mongoose from 'mongoose';
import { EventLog } from '../../models/index.js';
import { logger } from '../../config/logger.js';

export class EventLogRepository {
    async log(eventData) {
        try {
            const logEntry = new EventLog({
                ...eventData,
                timestamp: new Date()
            });
            await logEntry.save();
            return logEntry;
        } catch (error) {
            // Log warning but don't throw to prevent blockages of critical paths
            logger.warn('Failed to log event', { error: error.message, eventData });
            return null;
        }
    }

    async findRecentByOrg(organizationId, limit = 50) {
        try {
            return await EventLog.find({ organizationId })
                .sort({ timestamp: -1 })
                .limit(limit)
                .populate('userId', 'email firstName lastName');
        } catch (error) {
            logger.error('Error in EventLogRepository.findRecentByOrg', { organizationId, error: error.message });
            throw error;
        }
    }

    async findRecentByUser(userId, limit = 50) {
        try {
            return await EventLog.find({ userId })
                .sort({ timestamp: -1 })
                .limit(limit);
        } catch (error) {
            logger.error('Error in EventLogRepository.findRecentByUser', { userId, error: error.message });
            throw error;
        }
    }

    async getEventStats(organizationId, days = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            return await EventLog.aggregate([
                {
                    $match: {
                        organizationId: new mongoose.Types.ObjectId(organizationId),
                        timestamp: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: '$action',
                        count: { $sum: 1 }
                    }
                }
            ]);
        } catch (error) {
            logger.error('Error in EventLogRepository.getEventStats', { organizationId, error: error.message });
            throw error;
        }
    }
}

export default EventLogRepository;
