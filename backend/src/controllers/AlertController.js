// Price alerts - notify users when assets hit target prices
// Supports above/below/equals conditions

export class AlertController {
    constructor({ alertService }) {
        this.alertService = alertService;
    }

    // List alerts with optional filters - if userId provided, returns just that user's alerts
    async listAlerts(req, res, next) {
        try {
            const { userId, symbol, isActive, isTriggered, page, limit, sort } = req.query;

            // Fast path for user-specific alerts
            if (userId) {
                const alerts = await this.alertService.getUserAlerts(userId, {
                    isActive: isActive !== undefined ? isActive : null,
                    sort: sort || '-createdAt',
                });

                return res.status(200).json({
                    requestId: req.requestId,
                    timestamp: new Date().toISOString(),
                    alerts,
                });
            }

            // General listing with filters
            const filter = {};
            if (symbol) filter.symbol = symbol.toUpperCase();
            if (isActive !== undefined) filter.isActive = isActive;
            if (isTriggered !== undefined) filter.isTriggered = isTriggered;

            const result = await this.alertService.listAlerts({
                page: page || 1,
                limit: limit || 20,
                filter,
                sort: sort || '-createdAt',
            });

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                ...result,
            });
        } catch (error) {
            next(error);
        }
    }

    // Get single alert by ID
    async getAlert(req, res, next) {
        try {
            const alert = await this.alertService.getAlert(req.params.id);

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                alert,
            });
        } catch (error) {
            if (error.message === 'Alert not found') {
                return res.status(404).json({
                    error: { code: 'E4001', message: 'Alert not found' },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }

    // Create new price alert
    async createAlert(req, res, next) {
        try {
            const alert = await this.alertService.createAlert(req.body);

            res.status(201).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'Alert created successfully',
                alert,
            });
        } catch (error) {
            next(error);
        }
    }

    // Update existing alert
    async updateAlert(req, res, next) {
        try {
            const alert = await this.alertService.updateAlert(req.params.id, req.body);

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'Alert updated successfully',
                alert,
            });
        } catch (error) {
            if (error.message === 'Alert not found') {
                return res.status(404).json({
                    error: { code: 'E4001', message: 'Alert not found' },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }

    // Delete alert permanently
    async deleteAlert(req, res, next) {
        try {
            await this.alertService.deleteAlert(req.params.id);

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'Alert deleted successfully',
            });
        } catch (error) {
            if (error.message === 'Alert not found') {
                return res.status(404).json({
                    error: { code: 'E4001', message: 'Alert not found' },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }

    // Turn alert on - starts monitoring price
    async activateAlert(req, res, next) {
        try {
            const alert = await this.alertService.updateAlert(req.params.id, { isActive: true });

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'Alert activated successfully',
                alert,
            });
        } catch (error) {
            if (error.message === 'Alert not found') {
                return res.status(404).json({
                    error: { code: 'E4001', message: 'Alert not found' },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }

    // Turn alert off - stops monitoring but keeps the record
    async deactivateAlert(req, res, next) {
        try {
            const alert = await this.alertService.updateAlert(req.params.id, { isActive: false });

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'Alert deactivated successfully',
                alert,
            });
        } catch (error) {
            if (error.message === 'Alert not found') {
                return res.status(404).json({
                    error: { code: 'E4001', message: 'Alert not found' },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }
}

export default AlertController;