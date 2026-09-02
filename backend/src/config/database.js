// MongoDB database configuration with connection pooling

import mongoose from 'mongoose';
import { config } from './environment.js';
import { logger } from './logger.js';

const mongoOptions = {
    maxPoolSize: config.database.poolSize,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4
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
        logger.error('❌ Failed to connect to MongoDB', { error: error.message });
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
