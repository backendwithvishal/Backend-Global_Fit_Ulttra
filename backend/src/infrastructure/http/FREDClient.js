// FRED client for economic indicators (no official rate limit)

import { BaseApiClient } from './BaseApiClient.js';
import { config } from '../../config/environment.js';
import { ValidationError } from '../../utils/errors.js';
import { Money } from '../../utils/valueObjects.js';

export class FREDClient extends BaseApiClient {
    constructor(options = {}) {
        super('fred', {
            baseURL: 'https://api.stlouisfed.org/fred',
            timeout: 15000,
            onCircuitStateChange: options.onCircuitStateChange,
        });

        this.apiKey = config.apiKeys.fred;
    }

    async getSeriesObservations(params = {}) {
        const { seriesId = 'GDP', limit = 1 } = params;

        const response = await this.get('/series/observations', {
            series_id: seriesId,
            api_key: this.apiKey,
            file_type: 'json',
            sort_order: 'desc',
            limit,
        });

        return this._normalizeResponse(response, seriesId);
    }

    _normalizeResponse(response, seriesId) {
        if (!response.observations || response.observations.length === 0) {
            throw new ValidationError(
                `No data returned for FRED series: ${seriesId}`,
                [{ field: 'seriesId', message: 'Invalid or unknown series ID' }]
            );
        }

        const latest = response.observations[0];

        // Handle missing data points (FRED uses "." for missing)
        const value = latest.value === '.' ? null : new Money(latest.value).toString();

        return {
            indicator: seriesId,
            value,
            date: latest.date || null,
            realtimeStart: response.realtime_start || null,
            realtimeEnd: response.realtime_end || null,
            observations: response.observations.map(obs => ({
                date: obs.date,
                value: obs.value === '.' ? null : new Money(obs.value).toString(),
            })),
            source: 'fred',
        };
    }
}

export default FREDClient;
