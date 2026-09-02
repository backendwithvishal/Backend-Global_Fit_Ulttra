// Request validation - Zod-based validation for body/params/query

import { logger } from '../config/logger.js';

// Creates middleware that validates request against Zod schema
export const validateRequest = (schema) => {
    return (req, res, next) => {
        // Build validation payload from request
        const payload = {};

        if (req.body && Object.keys(req.body).length > 0) {
            payload.body = req.body;
        }
        if (req.params && Object.keys(req.params).length > 0) {
            payload.params = req.params;
        }
        if (req.query && Object.keys(req.query).length > 0) {
            payload.query = req.query;
        }

        // Validate with Zod
        const result = schema.safeParse(payload);

        if (!result.success) {
            // Log validation failures
            logger.debug('Request validation failed', {
                path: req.path,
                method: req.method,
                errors: result.error.errors.map(e => ({
                    field: e.path.join('.'),
                    message: e.message,
                })),
                requestId: req.requestId,
            });

            // Return structured error response matching existing error format
            return res.status(400).json({
                error: {
                    code: 'E1008',
                    message: 'Validation error',
                    details: result.error.errors.map(e => ({
                        field: e.path.join('.'),
                        message: e.message,
                    })),
                },
                requestId: req.requestId,
            });
        }

        // Replace request data with validated & coerced values.
        // This strips unrecognized fields and applies transformations
        // (e.g., toLowerCase, toUpperCase, Number coercion).
        if (result.data.body) req.body = result.data.body;
        if (result.data.params) req.params = result.data.params;
        if (result.data.query) req.query = result.data.query;

        next();
    };
};

export default validateRequest;
