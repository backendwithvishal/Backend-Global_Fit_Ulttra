// Alert validation schemas

import { z } from 'zod';

export const createAlertSchema = z.object({
    body: z.object({
        userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format'),
        symbol: z.string()
            .min(1, 'Symbol is required')
            .toUpperCase()
            .trim(),
        assetType: z.enum(['stock', 'crypto', 'forex', 'commodity', 'index']).optional(),
        condition: z.enum(['above', 'below', 'equals'], {
            errorMap: () => ({ message: 'Condition must be above, below, or equals' }),
        }),
        targetPrice: z.number()
            .positive('Target price must be positive')
            .finite('Target price must be a valid number'),
        notificationMethod: z.object({
            email: z.boolean().optional(),
            websocket: z.boolean().optional(),
        }).optional(),
        expiresAt: z.string().datetime().optional(),
        notes: z.string()
            .max(500, 'Notes must be 500 characters or less')
            .optional(),
    }),
});

export const updateAlertSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid alert ID format'),
    }),
    body: z.object({
        condition: z.enum(['above', 'below', 'equals']).optional(),
        targetPrice: z.number()
            .positive('Target price must be positive')
            .finite('Target price must be a valid number')
            .optional(),
        isActive: z.boolean().optional(),
        notificationMethod: z.object({
            email: z.boolean().optional(),
            websocket: z.boolean().optional(),
        }).optional(),
        expiresAt: z.string().datetime().optional(),
        notes: z.string()
            .max(500, 'Notes must be 500 characters or less')
            .optional(),
    }),
});

export const getAlertSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid alert ID format'),
    }),
});

export const deleteAlertSchema = getAlertSchema;

export const listAlertsSchema = z.object({
    query: z.object({
        userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format').optional(),
        symbol: z.string().toUpperCase().optional(),
        isActive: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
        isTriggered: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
        page: z.string().regex(/^\d+$/).transform(Number).optional(),
        limit: z.string().regex(/^\d+$/).transform(Number).optional(),
        sort: z.string().optional(),
    }),
});

export const toggleAlertSchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid alert ID format'),
    }),
});

export default {
    createAlertSchema,
    updateAlertSchema,
    getAlertSchema,
    deleteAlertSchema,
    listAlertsSchema,
    toggleAlertSchema,
};
