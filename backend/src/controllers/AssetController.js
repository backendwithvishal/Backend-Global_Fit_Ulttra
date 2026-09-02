// Asset management - stocks, crypto, forex, commodities, indices
// The /live endpoint is expensive - hits external APIs in real-time

export class AssetController {
    constructor({ assetService, financialDataService }) {
        this.assetService = assetService;
        this.financialDataService = financialDataService;
    }

    // Search/list assets with filters - supports pagination
    async searchAssets(req, res, next) {
        try {
            const { type, search, isActive, page, limit, sort } = req.query;

            const filter = {};
            if (type) filter.type = type;
            if (isActive !== undefined) filter.isActive = isActive;

            const result = await this.assetService.searchAssets({
                page: page || 1,
                limit: limit || 20,
                filter,
                sort: sort || '-lastUpdated',
                search: search || '',
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

    // Get single asset by symbol (case-insensitive)
    async getAsset(req, res, next) {
        try {
            const asset = await this.assetService.getAsset(req.params.symbol);

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                asset,
            });
        } catch (error) {
            if (error.message === 'Asset not found') {
                return res.status(404).json({
                    error: { code: 'E5001', message: 'Asset not found' },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }

    // Get live data from external APIs - EXPENSIVE, hits Alpha Vantage/CoinGecko
    async getLiveAssetData(req, res, next) {
        try {
            const { symbol } = req.params;

            // Try to get asset type from DB, default to stock if not found
            let asset;
            try {
                asset = await this.assetService.getAsset(symbol);
            } catch (error) {
                asset = null;
            }

            const assetType = asset?.type || 'stock';
            let liveData;

            if (assetType === 'stock') {
                liveData = await this.financialDataService.execute({
                    stockSymbol: symbol,
                    cryptoIds: '',
                    baseCurrency: 'USD',
                    newsQuery: symbol,
                    fredSeriesId: 'GDP',
                });
            } else if (assetType === 'crypto') {
                liveData = await this.financialDataService.execute({
                    stockSymbol: 'IBM',
                    cryptoIds: symbol.toLowerCase(),
                    baseCurrency: 'USD',
                    newsQuery: symbol,
                    fredSeriesId: 'GDP',
                });
            }

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                symbol,
                assetInfo: asset,
                liveData,
            });
        } catch (error) {
            next(error);
        }
    }

    // Create new asset
    async createAsset(req, res, next) {
        try {
            const asset = await this.assetService.createAsset(req.body);

            res.status(201).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'Asset created successfully',
                asset,
            });
        } catch (error) {
            if (error.message === 'Asset with this symbol already exists') {
                return res.status(409).json({
                    error: { code: 'E5002', message: 'Asset with this symbol already exists' },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }

    // Update existing asset
    async updateAsset(req, res, next) {
        try {
            const asset = await this.assetService.updateAsset(req.params.symbol, req.body);

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'Asset updated successfully',
                asset,
            });
        } catch (error) {
            if (error.message === 'Asset not found') {
                return res.status(404).json({
                    error: { code: 'E5001', message: 'Asset not found' },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }

    // Delete asset
    async deleteAsset(req, res, next) {
        try {
            await this.assetService.deleteAsset(req.params.symbol);

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                message: 'Asset deleted successfully',
            });
        } catch (error) {
            if (error.message === 'Asset not found') {
                return res.status(404).json({
                    error: { code: 'E5001', message: 'Asset not found' },
                    requestId: req.requestId,
                });
            }
            next(error);
        }
    }
}

export default AssetController;