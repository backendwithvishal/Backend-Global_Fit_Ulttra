// AI endpoint validation schemas

import { z } from 'zod';

// Sentiment analysis
export const sentimentSchema = z.object({
    text: z.string()
        .min(1, 'Text is required')
        .max(10000, 'Text too long (max 10,000 characters)'),
    type: z.enum(['news', 'general']).optional().default('general'),
});

// Asset analysis
export const analyzeSchema = z.object({
    symbol: z.string()
        .min(1, 'Symbol is required')
        .max(10, 'Symbol too long')
        .regex(/^[A-Z0-9.-]+$/i, 'Invalid symbol format'),
    priceData: z.object({
        current: z.number().positive('Current price must be positive'),
        change24h: z.number(),
        volume: z.number().nonnegative().optional(),
        high24h: z.number().positive().optional(),
        low24h: z.number().positive().optional(),
    }),
    timeframe: z.enum(['1h', '4h', '1d', '1w', '1m']).optional().default('1d'),
});

// Asset comparison
export const compareSchema = z.object({
    assets: z.array(z.object({
        symbol: z.string().min(1).max(10),
        price: z.number().positive(),
        change24h: z.number(),
    })).min(2, 'At least 2 assets are required for comparison'),
});

// Recommendation
export const recommendSchema = z.object({
    userProfile: z.object({
        riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']),
        horizon: z.enum(['short-term', 'medium-term', 'long-term']).optional(),
        portfolioSize: z.number().positive().optional(),
        investmentGoals: z.array(z.string()).optional(),
    }),
    marketData: z.array(z.object({
        symbol: z.string(),
        price: z.number().positive(),
        change24h: z.number(),
    })).min(1, 'At least one market data point required'),
});

// Portfolio analysis
export const portfolioSchema = z.object({
    holdings: z.array(z.object({
        symbol: z.string().min(1),
        quantity: z.number().positive(),
        avgBuyPrice: z.number().positive().optional(),
        currentPrice: z.number().positive().optional(),
    })).min(1, 'At least one holding required'),
    marketConditions: z.object({
        trend: z.enum(['bullish', 'bearish', 'sideways']).optional(),
        volatility: z.enum(['low', 'medium', 'high']).optional(),
    }).optional(),
});

// Price prediction
export const predictSchema = z.object({
    symbol: z.string().min(1).max(10),
    historicalData: z.array(z.object({
        date: z.string(),
        price: z.number().positive(),
        volume: z.number().nonnegative().optional(),
    })).min(5, 'At least 5 historical data points required'),
    daysAhead: z.number().int().min(1).max(90).optional().default(7),
});

// Market movement explanation
export const explainSchema = z.object({
    symbol: z.string().min(1).max(10),
    changePercent: z.number(),
    recentNews: z.array(z.object({
        title: z.string(),
        source: z.string().optional(),
    })).optional().default([]),
});

// News impact analysis
export const newsImpactSchema = z.object({
    newsArticles: z.array(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        source: z.string().optional(),
        publishedAt: z.string().optional(),
    })).min(1, 'At least one news article required'),
});

// News summary
export const newsSummarySchema = z.object({
    newsArticles: z.array(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        content: z.string().optional(),
    })).min(1, 'At least one news article required'),
    maxLength: z.number().int().min(50).max(1000).optional().default(100),
});

// Job submission
export const jobSchema = z.object({
    jobType: z.string().min(1, 'Job type is required'),
    data: z.record(z.unknown()),
    priority: z.number().int().min(0).max(10).optional().default(0),
});

// Chat request
export const chatSchema = z.object({
    message: z.string().min(1).max(5000),
    sessionId: z.string().optional(),
    context: z.object({
        topic: z.string().optional(),
        previousMessages: z.number().int().max(20).optional(),
    }).optional(),
});

// Middleware factory for validating request body
export const validateRequest = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'E1008',
                    message: 'Validation error',
                    details: result.error.errors.map(e => ({
                        field: e.path.join('.'),
                        message: e.message,
                    })),
                },
                requestId: req.requestId,
            });
        }

        req.body = result.data;
        next();
    };
};

export default {
    sentimentSchema,
    analyzeSchema,
    compareSchema,
    recommendSchema,
    portfolioSchema,
    predictSchema,
    explainSchema,
    newsImpactSchema,
    newsSummarySchema,
    jobSchema,
    chatSchema,
    validateRequest,
};
