// Watchlist management - users can create named collections of assets to track

export class WatchlistController {
    constructor({ watchlistService }) {
        this.watchlistService = watchlistService;
    }

    // List watchlists - if userId provided, returns just that user's lists
    async listWatchlists(req, res, next) {
        try {
            const { userId, page, limit, isPublic, sort } = req.query;

            if (userId) {
                const watchlists = await this.watchlistService.getUserWatchlists(userId, {
                    sort: sort || '-createdAt',
                });

                return res.status(200).json({
                    requestId: req.requestId,
                    timestamp: new Date().toISOString(),
                    watchlists,
                });
            }

            const filter = {};
            if (isPublic !== undefined) {
                filter.isPublic = isPublic;
            }

            const result = await this.watchlistService.listWatchlists({
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

    // Get single watchlist by ID
    async getWatchlist(req, res, next) {
        try {
            const watchlist = await this.watchlistService.getWatchlist(req.params.id);

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                watchlist,
            });
        } catch (error) {
            if (error.message === 'Watchlist not found') {
                return res.status(404).json({
                    error: { code: 'E3001', message: 'Watchlist not found' },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }

    // Create new watchlist - name must be unique per user
    async createWatchlist(req, res, next) {
        try {
            const watchlist = await this.watchlistService.createWatchlist(req.body);

            res.status(201).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'Watchlist created successfully',
                watchlist,
            });
        } catch (error) {
            if (error.message === 'Watchlist name already exists for this user') {
                return res.status(409).json({
                    error: { code: 'E3002', message: 'Watchlist name already exists for this user' },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }

    // Update watchlist metadata - use addAsset/removeAsset to modify assets
    async updateWatchlist(req, res, next) {
        try {
            const watchlist = await this.watchlistService.updateWatchlist(req.params.id, req.body);

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'Watchlist updated successfully',
                watchlist,
            });
        } catch (error) {
            if (error.message === 'Watchlist not found') {
                return res.status(404).json({
                    error: { code: 'E3001', message: 'Watchlist not found' },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }

    // Delete watchlist permanently
    async deleteWatchlist(req, res, next) {
        try {
            await this.watchlistService.deleteWatchlist(req.params.id);

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'Watchlist deleted successfully',
            });
        } catch (error) {
            if (error.message === 'Watchlist not found') {
                return res.status(404).json({
                    error: { code: 'E3001', message: 'Watchlist not found' },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }

    // Add asset to watchlist (e.g., "AAPL", "BTC")
    async addAsset(req, res, next) {
        try {
            const { symbol, notes } = req.body;
            const watchlist = await this.watchlistService.addAssetToWatchlist(
                req.params.id,
                symbol,
                notes
            );

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'Asset added to watchlist successfully',
                watchlist,
            });
        } catch (error) {
            if (error.message === 'Watchlist not found') {
                return res.status(404).json({
                    error: { code: 'E3001', message: 'Watchlist not found' },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }

    // Remove asset from watchlist - doesn't delete the asset itself
    async removeAsset(req, res, next) {
        try {
            const watchlist = await this.watchlistService.removeAssetFromWatchlist(
                req.params.id,
                req.params.symbol
            );

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'Asset removed from watchlist successfully',
                watchlist,
            });
        } catch (error) {
            if (error.message === 'Watchlist not found') {
                return res.status(404).json({
                    error: { code: 'E3001', message: 'Watchlist not found' },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }
}

export default WatchlistController;
