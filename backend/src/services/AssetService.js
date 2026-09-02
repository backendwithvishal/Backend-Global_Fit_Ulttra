// Asset management - CRUD operations for stocks, crypto, forex, etc.

import { logger } from '../config/logger.js';

export class AssetService {
    constructor({ financialAssetRepository }) {
        this.financialAssetRepository = financialAssetRepository;
    }

    // Create new asset - checks for duplicate symbols
    async createAsset(assetData) {
        try {
            const existing = await this.financialAssetRepository.findBySymbol(assetData.symbol);
            if (existing) {
                throw new Error('Asset with this symbol already exists');
            }

            const asset = await this.financialAssetRepository.create(assetData);
            logger.info('Financial asset created successfully', { symbol: asset.symbol });

            return asset;
        } catch (error) {
            logger.error('Error in createAsset', { error: error.message });
            throw error;
        }
    }

    // Get asset by symbol
    async getAsset(symbol) {
        try {
            const asset = await this.financialAssetRepository.findBySymbol(symbol);

            if (!asset) {
                throw new Error('Asset not found');
            }

            return asset;
        } catch (error) {
            logger.error('Error in getAsset', { symbol, error: error.message });
            throw error;
        }
    }

    // Search/list assets with pagination
    async searchAssets(options = {}) {
        try {
            return await this.financialAssetRepository.findAll(options);
        } catch (error) {
            logger.error('Error in searchAssets', { error: error.message });
            throw error;
        }
    }

    // Update asset
    async updateAsset(symbol, updateData) {
        try {
            const asset = await this.financialAssetRepository.updateBySymbol(symbol, updateData);

            if (!asset) {
                throw new Error('Asset not found');
            }

            logger.info('Asset updated successfully', { symbol });
            return asset;
        } catch (error) {
            logger.error('Error in updateAsset', { symbol, error: error.message });
            throw error;
        }
    }

    // Update asset price from external API
    async updateAssetPrice(symbol, price, source = 'api') {
        try {
            const asset = await this.financialAssetRepository.updatePrice(symbol, price, source);

            if (!asset) {
                throw new Error('Asset not found');
            }

            return asset;
        } catch (error) {
            logger.error('Error in updateAssetPrice', { symbol, error: error.message });
            throw error;
        }
    }

    // Delete asset
    async deleteAsset(symbol) {
        try {
            const asset = await this.financialAssetRepository.deleteBySymbol(symbol);

            if (!asset) {
                throw new Error('Asset not found');
            }

            logger.info('Asset deleted successfully', { symbol });
            return asset;
        } catch (error) {
            logger.error('Error in deleteAsset', { symbol, error: error.message });
            throw error;
        }
    }

    // Get assets by type (stock, crypto, forex, etc.)
    async getAssetsByType(type, options = {}) {
        try {
            return await this.financialAssetRepository.findByType(type, options);
        } catch (error) {
            logger.error('Error in getAssetsByType', { type, error: error.message });
            throw error;
        }
    }
}

export default AssetService;
