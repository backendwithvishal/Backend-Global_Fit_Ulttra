// Audit log repository for MongoDB operations

import { AuditLog } from '../../models/AuditLog.js';
import { logger } from '../../config/logger.js';
import { DatabaseError } from '../../utils/errors.js';

export class AuditLogRepository {
    async create(data) {
        try {
            const auditLog = new AuditLog(data);
            await auditLog.save();
            logger.debug('Audit log created', { requestId: data.requestId });
            return auditLog.toObject();
        } catch (error) {
            logger.error('Failed to create audit log', { error: error.message });
            throw new DatabaseError('Failed to create audit log', error);
        }
    }

    async findByRequestId(requestId) {
        try {
            const auditLog = await AuditLog.findOne({ requestId }).lean();
            return auditLog;
        } catch (error) {
            logger.error('Failed to find audit log', { error: error.message });
            throw new DatabaseError('Failed to find audit log', error);
        }
    }

    async getRecent(options = {}) {
        const { limit = 50, status } = options;

        try {
            const query = status ? { status } : {};
            const logs = await AuditLog.find(query)
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean();
            return logs;
        } catch (error) {
            logger.error('Failed to get recent audit logs', { error: error.message });
            throw new DatabaseError('Failed to get recent logs', error);
        }
    }

    async getErrors(limit = 20) {
        try {
            const logs = await AuditLog.find({
                $or: [
                    { status: 'error' },
                    { 'apiCalls.status': 'error' },
                ],
            })
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean();
            return logs;
        } catch (error) {
            logger.error('Failed to get error logs', { error: error.message });
            throw new DatabaseError('Failed to get error logs', error);
        }
    }

    async getMetrics(hours = 24) {
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);

        try {
            const pipeline = [
                { $match: { createdAt: { $gte: since } } },
                {
                    $group: {
                        _id: null,
                        totalRequests: { $sum: 1 },
                        successCount: {
                            $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] },
                        },
                        errorCount: {
                            $sum: { $cond: [{ $eq: ['$status', 'error'] }, 1, 0] },
                        },
                        avgDuration: { $avg: '$totalDuration' },
                        totalCacheHits: { $sum: '$cacheHits' },
                    },
                },
            ];

            const [result] = await AuditLog.aggregate(pipeline);

            return result || {
                totalRequests: 0,
                successCount: 0,
                errorCount: 0,
                avgDuration: 0,
                totalCacheHits: 0,
            };
        } catch (error) {
            logger.error('Failed to get metrics', { error: error.message });
            throw new DatabaseError('Failed to get metrics', error);
        }
    }
}

export default AuditLogRepository;
