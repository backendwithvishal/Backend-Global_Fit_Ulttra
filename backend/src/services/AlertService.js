// Alert management - create, update, check triggers

import { logger } from '../config/logger.js';

export class AlertService {
    constructor({ alertRepository }) {
        this.alertRepository = alertRepository;
    }

    // Create new alert
    async createAlert(alertData) {
        try {
            const alert = await this.alertRepository.create(alertData);
            logger.info('Alert created successfully', { alertId: alert._id });
            return alert;
        } catch (error) {
            logger.error('Error in createAlert', { error: error.message });
            throw error;
        }
    }

    // Get alert by ID
    async getAlert(alertId) {
        try {
            const alert = await this.alertRepository.findById(alertId, true);

            if (!alert) {
                throw new Error('Alert not found');
            }

            return alert;
        } catch (error) {
            logger.error('Error in getAlert', { alertId, error: error.message });
            throw error;
        }
    }

    // Get all alerts for a user
    async getUserAlerts(userId, options = {}) {
        try {
            return await this.alertRepository.findByUserId(userId, options);
        } catch (error) {
            logger.error('Error in getUserAlerts', { userId, error: error.message });
            throw error;
        }
    }

    // Get all active alerts (for background monitoring)
    async getActiveAlerts() {
        try {
            return await this.alertRepository.findActive();
        } catch (error) {
            logger.error('Error in getActiveAlerts', { error: error.message });
            throw error;
        }
    }

    // List alerts with pagination
    async listAlerts(options = {}) {
        try {
            return await this.alertRepository.findAll(options);
        } catch (error) {
            logger.error('Error in listAlerts', { error: error.message });
            throw error;
        }
    }

    // Update alert
    async updateAlert(alertId, updateData) {
        try {
            const alert = await this.alertRepository.update(alertId, updateData);

            if (!alert) {
                throw new Error('Alert not found');
            }

            logger.info('Alert updated successfully', { alertId });
            return alert;
        } catch (error) {
            logger.error('Error in updateAlert', { alertId, error: error.message });
            throw error;
        }
    }

    // Delete alert
    async deleteAlert(alertId) {
        try {
            const success = await this.alertRepository.delete(alertId);

            if (!success) {
                throw new Error('Alert not found');
            }

            logger.info('Alert deleted successfully', { alertId });
            return success;
        } catch (error) {
            logger.error('Error in deleteAlert', { alertId, error: error.message });
            throw error;
        }
    }

    // Check if price triggers any alerts for a symbol
    async checkAndTriggerAlerts(symbol, currentPrice) {
        try {
            return await this.alertRepository.checkAndTrigger(symbol, currentPrice);
        } catch (error) {
            logger.error('Error in checkAndTriggerAlerts', { symbol, error: error.message });
            throw error;
        }
    }

    // Deactivate expired alerts (cleanup job)
    async deactivateExpiredAlerts() {
        try {
            return await this.alertRepository.deactivateExpired();
        } catch (error) {
            logger.error('Error in deactivateExpiredAlerts', { error: error.message });
            throw error;
        }
    }
}

export default AlertService;
