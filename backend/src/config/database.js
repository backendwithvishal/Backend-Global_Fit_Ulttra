// MongoDB database configuration with connection pooling

import mongoose from 'mongoose';
import { config } from './environment.js';
import { logger } from './logger.js';

/**
 * Safely sanitizes and formats a MongoDB connection URI.
 * Automatically URL-encodes special characters in username and password
 * if they were not already properly URL-encoded (e.g. '@', '#', ':', '/', '?').
 *
 * @param {string} uri - The MongoDB URI to sanitize
 * @returns {string} Sanitized MongoDB URI
 */
export const sanitizeMongoUri = (uri) => {
    if (!uri || typeof uri !== 'string') return uri;

    try {
        const schemeMatch = uri.match(/^(mongodb(?:\+srv)?:\/\/)/i);
        if (!schemeMatch) return uri;

        const scheme = schemeMatch[1];
        const afterScheme = uri.slice(scheme.length);

        // Separate host/userinfo from path and query string
        const slashIdx = afterScheme.indexOf('/');
        const queryIdx = afterScheme.indexOf('?');

        let pathAndQuery = '';
        let authority = afterScheme;

        if (slashIdx !== -1) {
            authority = afterScheme.slice(0, slashIdx);
            pathAndQuery = afterScheme.slice(slashIdx);
        } else if (queryIdx !== -1) {
            authority = afterScheme.slice(0, queryIdx);
            pathAndQuery = afterScheme.slice(queryIdx);
        }

        // Find last '@' in authority (separates credentials from host)
        const lastAtIdx = authority.lastIndexOf('@');
        if (lastAtIdx === -1) return uri; // No credentials in URI

        const userinfo = authority.slice(0, lastAtIdx);
        const host = authority.slice(lastAtIdx + 1);

        const firstColonIdx = userinfo.indexOf(':');
        if (firstColonIdx === -1) return uri;

        const rawUser = userinfo.slice(0, firstColonIdx);
        const rawPass = userinfo.slice(firstColonIdx + 1);

        let decodedUser = rawUser;
        let decodedPass = rawPass;

        try {
            decodedUser = decodeURIComponent(rawUser);
        } catch {
            decodedUser = rawUser;
        }

        try {
            decodedPass = decodeURIComponent(rawPass);
        } catch {
            decodedPass = rawPass;
        }

        const encodedUser = encodeURIComponent(decodedUser);
        const encodedPass = encodeURIComponent(decodedPass);

        return `${scheme}${encodedUser}:${encodedPass}@${host}${pathAndQuery}`;
    } catch {
        return uri;
    }
};

export const connectDatabase = async () => {
    const sanitizedUri = sanitizeMongoUri(config.database.uri);
    const mongoOptions = {
        maxPoolSize: config.database.poolSize,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        // Note: Do not force family: 4 on SRV (mongodb+srv://) URIs as it interferes with Node.js DNS SRV resolution
        ...(sanitizedUri && !sanitizedUri.startsWith('mongodb+srv://') ? { family: 4 } : {}),
    };

    try {
        mongoose.connection.on('connected', () => {
            logger.info('✅ MongoDB connected successfully');
        });

        mongoose.connection.on('error', (err) => {
            logger.error('❌ MongoDB connection error', { error: err.message });
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('⚠️ MongoDB disconnected');
        });

        await mongoose.connect(sanitizedUri, mongoOptions);

        return mongoose;
    } catch (error) {
        const isAuthError = error.code === 18 ||
            (error.message && (
                error.message.includes('bad auth') ||
                error.message.includes('authentication failed') ||
                error.message.includes('Authentication failed')
            ));

        if (error.code === 'ENOTFOUND' || (error.message && error.message.includes('querySrv ENOTFOUND'))) {
            logger.error('❌ MongoDB SRV DNS Lookup Failed! Please check your MONGODB_URI environment variable on Render/hosting service.', {
                details: 'The MongoDB Atlas cluster hostname in MONGODB_URI could not be found or resolved.',
                error: error.message
            });
        } else if (isAuthError) {
            logger.error('❌ MongoDB Authentication Failed! ("bad auth : authentication failed")', {
                details: 'The username, password, or authSource in MONGODB_URI is incorrect or contains unencoded special characters.',
                actionRequired: [
                    '1. Check your database username & password in hosting service environment variables (MONGODB_URI).',
                    '2. If your password contains special characters (like @, #, :, /, ?), URL-encode them (e.g. "@" -> "%40").',
                    '3. Ensure the MongoDB database user has readWrite permissions for the target database.',
                    '4. If auth database differs from target db, append "?authSource=admin" to MONGODB_URI.'
                ],
                error: error.message
            });
        } else {
            logger.error('❌ Failed to connect to MongoDB', { error: error.message });
        }
        throw error;
    }
};

export const closeDatabaseConnection = async () => {
    try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed gracefully');
    } catch (error) {
        logger.error('Error closing MongoDB connection', { error: error.message });
        throw error;
    }
};

export const isDatabaseConnected = () => {
    return mongoose.connection.readyState === 1;
};

export default {
    sanitizeMongoUri,
    connectDatabase,
    closeDatabaseConnection,
    isDatabaseConnected,
};

