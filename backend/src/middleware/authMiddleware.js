/**
 * JWT Authentication Middleware
 *
 * Verifies the Bearer token on protected routes and attaches
 * the decoded payload to req.user.
 *
 * Usage:
 *   router.get('/protected', requireAuth, handler)
 *
 * @module middleware/authMiddleware
 */

import jwt from 'jsonwebtoken';
import { config } from '../config/environment.js';

/**
 * Require a valid JWT token.
 * Returns 401 if missing/invalid, 403 if expired.
 */
export const requireAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null;

    // Fallback to cookie
    if (!token && req.headers.cookie) {
        const cookies = Object.fromEntries(
            req.headers.cookie.split(';').map(c => c.trim().split('='))
        );
        token = cookies['token'] || cookies['gfu_token'];
    }

    if (!token) {
        return res.status(401).json({
            error: { code: 'E1003', message: 'Authentication required. Please provide a Bearer token or cookie session.' },
            requestId: req.requestId,
        });
    }

    try {
        const payload = jwt.verify(token, config.security.jwtSecret);
        req.user = payload; // { userId, email, role, organizationId, iat, exp }
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(403).json({
                error: { code: 'E1006', message: 'Token expired. Please sign in again.' },
                requestId: req.requestId,
            });
        }
        return res.status(401).json({
            error: { code: 'E1007', message: 'Invalid token.' },
            requestId: req.requestId,
        });
    }
};

/**
 * Optionally attach user info from JWT if present — does NOT block unauthenticated requests.
 */
export const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null;

    if (!token && req.headers.cookie) {
        const cookies = Object.fromEntries(
            req.headers.cookie.split(';').map(c => c.trim().split('='))
        );
        token = cookies['token'] || cookies['gfu_token'];
    }

    if (token) {
        try {
            req.user = jwt.verify(token, config.security.jwtSecret);
        } catch {
            // Invalid token — treat as unauthenticated
        }
    }

    next();
};

/**
 * Route middleware to enforce specific user roles.
 */
export const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: { code: 'E1003', message: 'Authentication required.' },
                requestId: req.requestId,
            });
        }

        // If user has a role, compare it
        const userRole = req.user.role || 'Member';
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                error: { code: 'E1009', message: 'Forbidden. Insufficient permissions.' },
                requestId: req.requestId,
            });
        }

        next();
    };
};

export default requireAuth;
