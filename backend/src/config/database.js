// MongoDB database configuration with connection pooling

import mongoose from 'mongoose';
import { config } from './environment.js';
import { logger } from './logger.js';

const mongoOptions = {
    maxPoolSize: config.database.poolSize,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    // Note: Do not force family: 4 on SRV (mongodb+srv://) URIs as it interferes with Node.js DNS SRV resolution
    ...(config.database.uri && !config.database.uri.startsWith('mongodb+srv://') ? { family: 4 } : {}),
};

export const connectDatabase = async () => {
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

        await mongoose.connect(config.database.uri, mongoOptions);

        return mongoose;
    } catch (error) {
        if (error.code === 'ENOTFOUND' || (error.message && error.message.includes('querySrv ENOTFOUND'))) {
            logger.error('❌ MongoDB SRV DNS Lookup Failed! Please check your MONGODB_URI environment variable on Render/hosting service.', {
                details: 'The MongoDB Atlas cluster hostname in MONGODB_URI could not be found or resolved.',
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
    connectDatabase,
    closeDatabaseConnection,
    isDatabaseConnected,
};
