// Watchlist validation schemas

import { z } from 'zod';

export const createWatchlistSchema = z.object({
    body: z.object({
        userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format'),
        name: z.string()
            .min(1, 'Watchlist name is required')
            .max(100, 'Watchlist name must be 100 characters or less')
            .trim(),
        description: z.string()
            .max(500, 'Description must be 500 characters or less')
            .trim()
            .optional(),
        assets: z.array(z.object({
            symbol: z.string().toUpperCase().trim(),
            notes: z.string().max(200).optional(),
        })).optional(),
        isDefault: z.boolean().optional(),
        isPublic: z.boolean().optional(),
        tags: z.array(z.string().trim().toLowerCase()).optional(),
    }),
});

export const updateWatchlistSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid watchlist ID format'),
    }),
    body: z.object({
        name: z.string()
            .min(1, 'Watchlist name is required')
            .max(100, 'Watchlist name must be 100 characters or less')
            .trim()
            .optional(),
        description: z.string()
            .max(500, 'Description must be 500 characters or less')
            .trim()
            .optional(),
        isDefault: z.boolean().optional(),
        isPublic: z.boolean().optional(),
        tags: z.array(z.string().trim().toLowerCase()).optional(),
    }),
});

export const getWatchlistSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid watchlist ID format'),
    }),
});

export const deleteWatchlistSchema = getWatchlistSchema;

export const listWatchlistsSchema = z.object({
    query: z.object({
        userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format').optional(),
        page: z.string().regex(/^\d+$/).transform(Number).optional(),
        limit: z.string().regex(/^\d+$/).transform(Number).optional(),
        isPublic: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
        sort: z.string().optional(),
    }),
});

export const addAssetSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid watchlist ID format'),
    }),
    body: z.object({
        symbol: z.string()
            .min(1, 'Symbol is required')
            .toUpperCase()
            .trim(),
        notes: z.string()
            .max(200, 'Notes must be 200 characters or less')
            .optional(),
    }),
});

export const removeAssetSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid watchlist ID format'),
        symbol: z.string().toUpperCase().trim(),
    }),
});

export default {
    createWatchlistSchema,
    updateWatchlistSchema,
    getWatchlistSchema,
    deleteWatchlistSchema,
    listWatchlistsSchema,
    addAssetSchema,
    removeAssetSchema,
};
