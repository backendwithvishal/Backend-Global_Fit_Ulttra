import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';

export const createOrganizationRoutes = (controller) => {
    const router = Router();

    // All routes in this router require authentication
    router.use(requireAuth);

    router.post('/', (req, res, next) => controller.createOrg(req, res, next));
    router.get('/', (req, res, next) => controller.getUserOrgs(req, res, next));
    router.get('/:id', (req, res, next) => controller.getOrg(req, res, next));
    
    // Invites
    router.post('/:orgId/invite', (req, res, next) => controller.inviteMember(req, res, next));
    router.get('/:orgId/invites', (req, res, next) => controller.getPendingInvites(req, res, next));
    router.post('/invite/accept', (req, res, next) => controller.acceptInvite(req, res, next));

    // Members
    router.delete('/:orgId/members/:userId', (req, res, next) => controller.removeMember(req, res, next));
    router.patch('/:orgId/members/:userId/role', (req, res, next) => controller.updateMemberRole(req, res, next));

    return router;
};

export default createOrganizationRoutes;
