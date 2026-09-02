import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';

export const createApiKeyRoutes = (controller) => {
    const router = Router();

    // All routes require authentication
    router.use(requireAuth);

    router.post('/', (req, res, next) => controller.createKey(req, res, next));
    router.get('/', (req, res, next) => controller.getKeys(req, res, next));
    router.delete('/:id', (req, res, next) => controller.deactivateKey(req, res, next));

    return router;
};

export default createApiKeyRoutes;
