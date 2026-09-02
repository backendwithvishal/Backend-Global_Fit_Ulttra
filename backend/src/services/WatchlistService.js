// Watchlist management - CRUD operations for user asset collections

import { logger } from '../config/logger.js';

export class WatchlistService {
    constructor({ watchlistRepository }) {
        this.watchlistRepository = watchlistRepository;
    }

    // Create new watchlist - enforces name uniqueness per user
    async createWatchlist(watchlistData) {
        try {
            const exists = await this.watchlistRepository.nameExistsForUser(
                watchlistData.userId,
                watchlistData.name
            );

            if (exists) {
                throw new Error('Watchlist name already exists for this user');
            }

            const watchlist = await this.watchlistRepository.create(watchlistData);
            logger.info('Watchlist created successfully', { watchlistId: watchlist._id });

            return watchlist;
        } catch (error) {
            logger.error('Error in createWatchlist', { error: error.message });
            throw error;
        }
    }

    // Get watchlist by ID
    async getWatchlist(watchlistId) {
        try {
            const watchlist = await this.watchlistRepository.findById(watchlistId, true);

            if (!watchlist) {
                throw new Error('Watchlist not found');
            }

            return watchlist;
        } catch (error) {
            logger.error('Error in getWatchlist', { watchlistId, error: error.message });
            throw error;
        }
    }

    // Get all watchlists for a user
    async getUserWatchlists(userId, options = {}) {
        try {
            return await this.watchlistRepository.findByUserId(userId, options);
        } catch (error) {
            logger.error('Error in getUserWatchlists', { userId, error: error.message });
            throw error;
        }
    }

    // List watchlists with pagination
    async listWatchlists(options = {}) {
        try {
            return await this.watchlistRepository.findAll(options);
        } catch (error) {
            logger.error('Error in listWatchlists', { error: error.message });
            throw error;
        }
    }

    // Update watchlist
    async updateWatchlist(watchlistId, updateData) {
        try {
            const watchlist = await this.watchlistRepository.update(watchlistId, updateData);

            if (!watchlist) {
                throw new Error('Watchlist not found');
            }

            logger.info('Watchlist updated successfully', { watchlistId });
            return watchlist;
        } catch (error) {
            logger.error('Error in updateWatchlist', { watchlistId, error: error.message });
            throw error;
        }
    }

    // Add asset to watchlist
    async addAssetToWatchlist(watchlistId, symbol, notes = '') {
        try {
            const watchlist = await this.watchlistRepository.addAsset(watchlistId, symbol, notes);

            if (!watchlist) {
                throw new Error('Watchlist not found');
            }

            logger.info('Asset added to watchlist', { watchlistId, symbol });
            return watchlist;
        } catch (error) {
            logger.error('Error in addAssetToWatchlist', { watchlistId, symbol, error: error.message });
            throw error;
        }
    }

    // Remove asset from watchlist
    async removeAssetFromWatchlist(watchlistId, symbol) {
        try {
            const watchlist = await this.watchlistRepository.removeAsset(watchlistId, symbol);

            if (!watchlist) {
                throw new Error('Watchlist not found');
            }

            logger.info('Asset removed from watchlist', { watchlistId, symbol });
            return watchlist;
        } catch (error) {
            logger.error('Error in removeAssetFromWatchlist', { watchlistId, symbol, error: error.message });
            throw error;
        }
    }

    // Delete watchlist
    async deleteWatchlist(watchlistId) {
        try {
            const success = await this.watchlistRepository.delete(watchlistId);

            if (!success) {
                throw new Error('Watchlist not found');
            }

            logger.info('Watchlist deleted successfully', { watchlistId });
            return success;
        } catch (error) {
            logger.error('Error in deleteWatchlist', { watchlistId, error: error.message });
            throw error;
        }
    }
}

export default WatchlistService;
