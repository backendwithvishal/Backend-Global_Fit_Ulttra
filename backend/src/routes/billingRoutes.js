import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';

export const createBillingRoutes = (controller) => {
    const router = Router();

    // All routes require authentication
    router.use(requireAuth);

    router.post('/checkout', (req, res, next) => controller.createSession(req, res, next));
    router.post('/confirm', (req, res, next) => controller.confirmCheckout(req, res, next));
    router.post('/cancel', (req, res, next) => controller.cancelSubscription(req, res, next));
    router.get('/invoices', (req, res, next) => controller.getInvoices(req, res, next));
    router.get('/coupons/:code', (req, res, next) => controller.applyCoupon(req, res, next));

    return router;
};

export default createBillingRoutes;
