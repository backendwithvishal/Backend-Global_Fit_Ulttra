// Finnhub client for market news (free tier: 60 requests/minute)

import { BaseApiClient } from './BaseApiClient.js';
import { config } from '../../config/environment.js';
import { ValidationError } from '../../utils/errors.js';

export class FinnhubClient extends BaseApiClient {
    constructor(options = {}) {
        super('finnhub', {
            baseURL: 'https://finnhub.io/api/v1',
            timeout: 15000,
            onCircuitStateChange: options.onCircuitStateChange,
        });

        this.apiKey = config.apiKeys.finnhub;
    }

    async getMarketNews(params = {}) {
        const { category = 'general' } = params;

        const response = await this.get('/news', {
            category,
            token: this.apiKey,
        });

        return this._normalizeResponse(response);
    }

    _normalizeResponse(response) {
        if (!Array.isArray(response)) {
            throw new ValidationError(
                'Invalid Finnhub response format',
                [{ message: 'Expected array of news items' }]
            );
        }

        if (response.length === 0) {
            return {
                news: [],
                source: 'finnhub',
            };
        }

        const news = response.slice(0, 10).map(item => ({
            id: item.id?.toString() || null,
            headline: item.headline || '',
            summary: item.summary || '',
            url: item.url || '',
            image: item.image || null,
            datetime: item.datetime
                ? new Date(item.datetime * 1000).toISOString()
                : null,
            category: item.category || 'general',
            related: item.related || null,
            sourceName: item.source || 'Unknown',
        }));

        return {
            news,
            source: 'finnhub',
        };
    }
}

export default FinnhubClient;
