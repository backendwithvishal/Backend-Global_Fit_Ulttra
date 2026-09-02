export class ApiKeyController {
    constructor({ apiKeyService }) {
        this.apiKeyService = apiKeyService;
    }

    async createKey(req, res, next) {
        try {
            const { name, organizationId, scopes } = req.body;
            const userId = req.user.userId;

            if (!name || !organizationId) {
                return res.status(400).json({ error: 'Name and organizationId are required', requestId: req.requestId });
            }

            const result = await this.apiKeyService.generateKey(userId, organizationId, name, scopes);
            res.status(201).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'API key created successfully. Save it now, it will not be shown again.',
                apiKey: result.apiKey,
                plainTextKey: result.plainTextKey
            });
        } catch (error) {
            next(error);
        }
    }

    async getKeys(req, res, next) {
        try {
            const { orgId } = req.query;
            let keys = [];
            if (orgId) {
                keys = await this.apiKeyService.getOrganizationKeys(orgId);
            } else {
                keys = await this.apiKeyService.getUserKeys(req.user.userId);
            }

            res.json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                keys
            });
        } catch (error) {
            next(error);
        }
    }

    async deactivateKey(req, res, next) {
        try {
            const { id } = req.params;
            const apiKey = await this.apiKeyService.deactivateKey(id);
            res.json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'API Key deactivated successfully.',
                apiKey
            });
        } catch (error) {
            next(error);
        }
    }
}

export default ApiKeyController;
