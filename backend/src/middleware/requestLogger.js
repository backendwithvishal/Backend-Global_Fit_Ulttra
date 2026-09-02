// Request logger - logs all HTTP requests with timing and metadata

import { logger } from '../config/logger.js';

// Logs request/response after response completes
export const requestLogger = (req, res, next) => {
    const startTime = Date.now();

    // Listen for response finish event
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        logger.info('HTTP Request', {
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            userId: req.user?.id || 'anonymous',
            requestId: req.requestId,
            contentLength: res.get('Content-Length'),
        });
    });

    next();
};

export default requestLogger;
