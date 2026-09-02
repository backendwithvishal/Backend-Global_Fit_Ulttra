// CoinGecko client for crypto prices (free tier: 10-50 requests/minute)

import { BaseApiClient } from './BaseApiClient.js';
import { ValidationError } from '../../utils/errors.js';
import { Money } from '../../utils/valueObjects.js';

export class CoinGeckoClient extends BaseApiClient {
    constructor(options = {}) {
        super('coingecko', {
            baseURL: 'https://api.coingecko.com/api/v3',
            timeout: 15000,
            onCircuitStateChange: options.onCircuitStateChange,
        });
    }

    async getSimplePrice(params = {}) {
        const { ids = 'bitcoin,ethereum', vsCurrencies = 'usd' } = params;

        const response = await this.get('/simple/price', {
            ids,
            vs_currencies: vsCurrencies,
            include_24hr_change: true,
            include_market_cap: true,
        });

        return this._normalizeResponse(response, ids, vsCurrencies);
    }

    _normalizeResponse(response, ids, vsCurrencies) {
        if (!response || Object.keys(response).length === 0) {
            throw new ValidationError(
                'No crypto data returned from CoinGecko',
                [{ field: 'ids', message: 'Invalid or unknown cryptocurrency IDs' }]
            );
        }

        const coins = [];
        const coinIds = ids.split(',').map(id => id.trim());
        const currencies = vsCurrencies.split(',').map(c => c.trim());

        for (const coinId of coinIds) {
            const coinData = response[coinId];
            if (!coinData) continue;

            for (const currency of currencies) {
                const price = coinData[currency];
                if (price === undefined) continue;

                const priceValue = new Money(price.toString());
                const change24h = coinData[`${currency}_24h_change`];
                const marketCap = coinData[`${currency}_market_cap`];

                coins.push({
                    id: coinId,
                    symbol: this._getSymbol(coinId),
                    currency: currency.toUpperCase(),
                    price: priceValue.toString(),
                    change24h: change24h ? new Money(change24h.toString()).toString() : null,
                    marketCap: marketCap ? new Money(marketCap.toString()).toString() : null,
                });
            }
        }

        const primary = coins[0];
        return {
            symbol: primary?.symbol || 'BTC',
            priceUSD: primary?.price || '0',
            change24h: primary?.change24h || null,
            allCoins: coins,
            source: 'coingecko',
        };
    }

    _getSymbol(coinId) {
        const symbols = {
            bitcoin: 'BTC',
            ethereum: 'ETH',
            tether: 'USDT',
            'binancecoin': 'BNB',
            ripple: 'XRP',
            cardano: 'ADA',
            solana: 'SOL',
            dogecoin: 'DOGE',
        };
        return symbols[coinId] || coinId.toUpperCase();
    }
}

export default CoinGeckoClient;
