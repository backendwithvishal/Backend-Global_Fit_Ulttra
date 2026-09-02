// User model - accounts with preferences and metadata

import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
    // Primary identifier for authentication
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },

    // Bcrypt hash - select:false prevents accidental exposure in API responses
    passwordHash: {
        type: String,
        required: false,
        select: false,
    },

    firstName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50,
    },

    lastName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50,
    },

    // Soft delete flag
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },

    // Email verification
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationToken: {
        type: String,
        select: false,
    },

    // Password reset
    passwordResetToken: {
        type: String,
        select: false,
    },
    passwordResetExpires: {
        type: Date,
        select: false,
    },

    // Multi-factor authentication (MFA)
    isTwoFactorEnabled: {
        type: Boolean,
        default: false,
    },
    twoFactorSecret: {
        type: String,
        select: false,
    },
    twoFactorBackupCodes: {
        type: [String],
        default: [],
        select: false,
    },

    // Subscription & Billing details
    subscriptionTier: {
        type: String,
        enum: ['Free', 'Starter', 'Pro', 'Enterprise'],
        default: 'Free',
        index: true,
    },
    subscriptionStatus: {
        type: String,
        default: 'active',
    },
    stripeCustomerId: {
        type: String,
        index: true,
    },
    stripeSubscriptionId: {
        type: String,
    },
    subscriptionPeriodEnd: {
        type: Date,
    },

    // Active session tracking & login logs
    loginHistory: [{
        ipAddress: String,
        device: String,
        timestamp: {
            type: Date,
            default: Date.now,
        }
    }],
    activeSessions: [{
        tokenHash: String,
        device: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    // User preferences for financial data
    preferences: {
        defaultCurrency: {
            type: String,
            default: 'USD',
            uppercase: true,
        },
        defaultStockSymbol: {
            type: String,
            default: 'IBM',
            uppercase: true,
        },
        defaultCryptoIds: {
            type: String,
            default: 'bitcoin,ethereum',
        },
        notifications: {
            email: {
                type: Boolean,
                default: true,
            },
            websocket: {
                type: Boolean,
                default: true,
            },
        },
    },

    // Extensible metadata for additional data
    metadata: {
        type: Schema.Types.Mixed,
        default: {},
    },
}, {
    timestamps: true,
    collection: 'users',
});

// Indexes for common queries
userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1, createdAt: -1 });

// Virtual property for full name
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Include virtuals in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Method to compare password with hash
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.passwordHash) {
        return false;
    }

    // Import bcrypt dynamically to avoid loading it if not needed
    // import() returns the module namespace { default: bcryptLib }, so use .default
    const bcrypt = await import('bcrypt');
    return bcrypt.default.compare(candidatePassword, this.passwordHash);
};

// Static method to hash password
userSchema.statics.hashPassword = async function (password) {
    // import() returns the module namespace { default: bcryptLib }, so use .default
    const bcrypt = await import('bcrypt');
    return bcrypt.default.hash(password, 10);
};

export const User = mongoose.model('User', userSchema);

export default User;
