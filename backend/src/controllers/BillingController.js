export class BillingController {
    constructor({ billingService }) {
        this.billingService = billingService;
    }

    async createSession(req, res, _next) {
        try {
            const { planId, billingCycle, couponCode } = req.body;
            const userId = req.user.userId;

            if (!planId) {
                return res.status(400).json({ error: 'planId is required', requestId: req.requestId });
            }

            const result = await this.billingService.createCheckoutSession(userId, planId, billingCycle, couponCode);
            res.json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                ...result
            });
        } catch (error) {
            res.status(400).json({ error: error.message, requestId: req.requestId });
        }
    }

    async confirmCheckout(req, res, _next) {
        try {
            const { sessionId, planId, billingCycle } = req.body;
            const userId = req.user.userId;

            if (!sessionId || !planId) {
                return res.status(400).json({ error: 'sessionId and planId are required', requestId: req.requestId });
            }

            const user = await this.billingService.confirmPayment(userId, sessionId, planId, billingCycle);
            res.json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'Payment confirmed. Subscription activated.',
                user
            });
        } catch (error) {
            res.status(400).json({ error: error.message, requestId: req.requestId });
        }
    }

    async cancelSubscription(req, res, next) {
        try {
            const userId = req.user.userId;
            const user = await this.billingService.cancelSubscription(userId);
            res.json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'Subscription will cancel at period end.',
                user
            });
        } catch (error) {
            next(error);
        }
    }

    async getInvoices(req, res, next) {
        try {
            const userId = req.user.userId;
            const invoices = await this.billingService.getInvoices(userId);
            res.json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                invoices
            });
        } catch (error) {
            next(error);
        }
    }

    async applyCoupon(req, res, _next) {
        try {
            const { code } = req.params;
            const coupon = await this.billingService.applyCoupon(code);
            res.json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                coupon
            });
        } catch (error) {
            res.status(400).json({ error: error.message, requestId: req.requestId });
        }
    }
}

export default BillingController;
