// Watchlist model - user collections of financial assets to track

import mongoose from 'mongoose';

const { Schema } = mongoose;

const watchlistSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: false,
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500,
    },
    assets: [{
        symbol: {
            type: String,
            required: true,
            uppercase: true,
        },
        addedAt: {
            type: Date,
            default: Date.now,
        },
        notes: {
            type: String,
            maxlength: 200,
        },
    }],
    isDefault: {
        type: Boolean,
        default: false,
    },
    isPublic: {
        type: Boolean,
        default: false,
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true,
    }],
    metadata: {
        type: Schema.Types.Mixed,
        default: {},
    },
}, {
    timestamps: true,
    collection: 'watchlists',
});

watchlistSchema.index({ userId: 1, createdAt: -1 });
watchlistSchema.index({ userId: 1, name: 1 }, { unique: true });
watchlistSchema.index({ isPublic: 1, createdAt: -1 });

// Add asset to watchlist
watchlistSchema.methods.addAsset = function (symbol, notes = '') {
    // Check if already exists
    const exists = this.assets.some(asset => asset.symbol === symbol.toUpperCase());

    if (!exists) {
        this.assets.push({
            symbol: symbol.toUpperCase(),
            addedAt: new Date(),
            notes,
        });
    }

    return this.save();
};

// Remove asset from watchlist
watchlistSchema.methods.removeAsset = function (symbol) {
    this.assets = this.assets.filter(asset => asset.symbol !== symbol.toUpperCase());
    return this.save();
};

// Virtual for asset count
watchlistSchema.virtual('assetCount').get(function () {
    return this.assets.length;
});

// Include virtuals in JSON
watchlistSchema.set('toJSON', { virtuals: true });
watchlistSchema.set('toObject', { virtuals: true });

export const Watchlist = mongoose.model('Watchlist', watchlistSchema);

export default Watchlist;
