// Financial asset model - stocks, crypto, forex with price tracking

import mongoose from 'mongoose';

const { Schema } = mongoose;

const financialAssetSchema = new Schema({
    symbol: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['stock', 'crypto', 'forex', 'commodity', 'index'],
        index: true,
    },
    currentPrice: {
        type: Number,
        default: null,
    },
    currency: {
        type: String,
        default: 'USD',
        uppercase: true,
    },
    lastUpdated: {
        type: Date,
        default: null,
    },
    metadata: {
        exchange: String,
        sector: String,
        industry: String,
        marketCap: Number,
        description: String,
        website: String,
        logo: String,
    },
    priceHistory: [{
        price: Number,
        timestamp: Date,
        source: String,
    }],
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
}, {
    timestamps: true,
    collection: 'financial_assets',
});

financialAssetSchema.index({ type: 1, isActive: 1 });
financialAssetSchema.index({ symbol: 1, type: 1 });
financialAssetSchema.index({ createdAt: -1 });

// Update price and add to history (keeps last 100 entries)
financialAssetSchema.methods.updatePrice = function (price, source = 'api') {
    this.currentPrice = price;
    this.lastUpdated = new Date();

    this.priceHistory.push({
        price,
        timestamp: new Date(),
        source,
    });

    if (this.priceHistory.length > 100) {
        this.priceHistory = this.priceHistory.slice(-100);
    }

    return this.save();
};

export const FinancialAsset = mongoose.model('FinancialAsset', financialAssetSchema);

export default FinancialAsset;
