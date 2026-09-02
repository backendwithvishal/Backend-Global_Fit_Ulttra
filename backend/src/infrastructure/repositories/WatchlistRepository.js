// Watchlist repository for database operations

import { Watchlist } from '../../models/index.js';
import { logger } from '../../config/logger.js';

export class WatchlistRepository {
    async create(watchlistData) {
        try {
            const watchlist = new Watchlist(watchlistData);
            await watchlist.save();
            logger.info('Watchlist created', { watchlistId: watchlist._id, userId: watchlist.userId });
            return watchlist;
        } catch (error) {
            logger.error('Error creating watchlist', { error: error.message });
            throw error;
        }
    }

    async findById(id, populate = false) {
        try {
            let query = Watchlist.findById(id);

            if (populate) {
                query = query.populate('userId', 'email firstName lastName');
            }

            return await query;
        } catch (error) {
            logger.error('Error finding watchlist by ID', { id, error: error.message });
            throw error;
        }
    }

    async findByUserId(userId, { sort = '-createdAt', limit = 100 } = {}) {
        try {
            return await Watchlist.find({ userId })
                .sort(sort)
                .limit(limit)
                .lean();
        } catch (error) {
            logger.error('Error finding watchlists by user ID', { userId, error: error.message });
            throw error;
        }
    }

    async findAll({ page = 1, limit = 20, filter = {}, sort = '-createdAt' } = {}) {
        try {
            const skip = (page - 1) * limit;

            const [watchlists, total] = await Promise.all([
                Watchlist.find(filter)
                    .populate('userId', 'email firstName lastName')
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Watchlist.countDocuments(filter),
            ]);

            return {
                watchlists,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            logger.error('Error finding watchlists', { error: error.message });
            throw error;
        }
    }

    async update(id, updateData) {
        try {
            const watchlist = await Watchlist.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: true }
            );

            if (watchlist) {
                logger.info('Watchlist updated', { watchlistId: id });
            }

            return watchlist;
        } catch (error) {
            logger.error('Error updating watchlist', { id, error: error.message });
            throw error;
        }
    }

    async addAsset(id, symbol, notes = '') {
        try {
            const watchlist = await Watchlist.findById(id);

            if (!watchlist) {
                return null;
            }

            await watchlist.addAsset(symbol, notes);
            logger.info('Asset added to watchlist', { watchlistId: id, symbol });

            return watchlist;
        } catch (error) {
            logger.error('Error adding asset to watchlist', { id, symbol, error: error.message });
            throw error;
        }
    }

    async removeAsset(id, symbol) {
        try {
            const watchlist = await Watchlist.findById(id);

            if (!watchlist) {
                return null;
            }

            await watchlist.removeAsset(symbol);
            logger.info('Asset removed from watchlist', { watchlistId: id, symbol });

            return watchlist;
        } catch (error) {
            logger.error('Error removing asset from watchlist', { id, symbol, error: error.message });
            throw error;
        }
    }

    async delete(id) {
        try {
            const result = await Watchlist.findByIdAndDelete(id);

            if (result) {
                logger.info('Watchlist deleted', { watchlistId: id });
                return true;
            }

            return false;
        } catch (error) {
            logger.error('Error deleting watchlist', { id, error: error.message });
            throw error;
        }
    }

    async nameExistsForUser(userId, name, excludeId = null) {
        try {
            const query = { userId, name };
            if (excludeId) {
                query._id = { $ne: excludeId };
            }

            const count = await Watchlist.countDocuments(query);
            return count > 0;
        } catch (error) {
            logger.error('Error checking watchlist name existence', { userId, name, error: error.message });
            throw error;
        }
    }
}

export default WatchlistRepository;
