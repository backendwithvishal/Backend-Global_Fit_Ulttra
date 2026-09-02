import { Invitation } from '../../models/index.js';
import { logger } from '../../config/logger.js';

export class InvitationRepository {
    async create(inviteData) {
        try {
            const invite = new Invitation(inviteData);
            await invite.save();
            logger.info('Invitation created', { inviteId: invite._id, email: invite.email, orgId: invite.organizationId });
            return invite;
        } catch (error) {
            logger.error('Error in InvitationRepository.create', { error: error.message });
            throw error;
        }
    }

    async findById(id) {
        try {
            return await Invitation.findById(id).populate('organizationId', 'name');
        } catch (error) {
            logger.error('Error in InvitationRepository.findById', { id, error: error.message });
            throw error;
        }
    }

    async findByToken(token) {
        try {
            return await Invitation.findOne({ token, status: 'Pending' }).populate('organizationId', 'name');
        } catch (error) {
            logger.error('Error in InvitationRepository.findByToken', { error: error.message });
            throw error;
        }
    }

    async findByEmailAndOrg(email, organizationId) {
        try {
            return await Invitation.findOne({
                email: email.toLowerCase(),
                organizationId,
                status: 'Pending'
            });
        } catch (error) {
            logger.error('Error in InvitationRepository.findByEmailAndOrg', { email, organizationId, error: error.message });
            throw error;
        }
    }

    async findPendingByOrgId(organizationId) {
        try {
            return await Invitation.find({ organizationId, status: 'Pending' });
        } catch (error) {
            logger.error('Error in InvitationRepository.findPendingByOrgId', { organizationId, error: error.message });
            throw error;
        }
    }

    async updateStatus(id, status) {
        try {
            const invite = await Invitation.findByIdAndUpdate(
                id,
                { $set: { status } },
                { new: true }
            );
            return invite;
        } catch (error) {
            logger.error('Error in InvitationRepository.updateStatus', { id, status, error: error.message });
            throw error;
        }
    }
}

export default InvitationRepository;
