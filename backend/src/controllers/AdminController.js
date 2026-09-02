// Admin stuff - cache management, metrics, logs

import { logger } from '../config/logger.js';

export class AdminController {
    constructor({ cache, auditLogRepository }) {
        this.cache = cache;
        this.auditLogRepository = auditLogRepository;
    }

    // Clear all cached data - use this when APIs are returning stale/bad data
    async clearCache(req, res, next) {
        try {
            const cleared = await this.cache.clear();

            if (!cleared) {
                return res.status(500).json({
                    error: 'Failed to clear cache',
                    requestId: req.requestId,
                });
            }

            logger.info('Admin cleared cache', { requestId: req.requestId });

            res.json({
                success: true,
                message: 'Cache cleared successfully',
                requestId: req.requestId,
            });
        } catch (error) {
            next(error);
        }
    }

    // Get system metrics for the last X hours (default 24)
    async getMetrics(req, res, next) {
        try {
            const hours = parseInt(req.query.hours) || 24;
            const metrics = await this.auditLogRepository.getMetrics(hours);

            res.json({
                period: `Last ${hours} hours`,
                metrics,
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            next(error);
        }
    }

    // Get recent error logs - useful for debugging without SSH access
    async getLogs(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 20;
            const logs = await this.auditLogRepository.getErrors(limit);

            res.json({
                count: logs.length,
                logs,
                requestId: req.requestId,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default AdminController;