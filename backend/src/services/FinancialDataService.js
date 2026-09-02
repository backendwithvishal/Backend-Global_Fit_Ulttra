// Financial data orchestration - aggregates from 6 APIs with resilience
// Uses Promise.allSettled for fault tolerance

import { v4 as uuidv4 } from 'uuid';
import { logger } from '../config/logger.js';

export class FinancialDataService {
    constructor(dependencies) {
        this.alphaVantageClient = dependencies.alphaVantageClient;
        this.coinGeckoClient = dependencies.coinGeckoClient;
        this.exchangeRateClient = dependencies.exchangeRateClient;
        this.newsAPIClient = dependencies.newsAPIClient;
        this.fredClient = dependencies.fredClient;
        this.finnhubClient = dependencies.finnhubClient;
        this.cache = dependencies.cache;
        this.auditLogRepository = dependencies.auditLogRepository;
    }

    // Main orchestration - fetches from all 6 APIs in parallel
    async execute(options = {}) {
        const requestId = uuidv4();
        const startTime = Date.now();
        const apiCallResults = [];
        let cacheHits = 0;

        const {
            stockSymbol = 'IBM',
            cryptoIds = 'bitcoin,ethereum',
            baseCurrency = 'USD',
            newsQuery = 'finance OR stock market',
            fredSeriesId = 'GDP',
        } = options;

        logger.info('Starting financial data orchestration', { requestId });

        // Define all API calls with caching
        const apiCalls = [
            this._fetchWithCache('alpha_vantage', `stocks:${stockSymbol}`, () =>
                this.alphaVantageClient.getGlobalQuote(stockSymbol)
            ),
            this._fetchWithCache('coingecko', `crypto:${cryptoIds}`, () =>
                this.coinGeckoClient.getSimplePrice({ ids: cryptoIds })
            ),
            this._fetchWithCache('exchangerate_api', `forex:${baseCurrency}`, () =>
                this.exchangeRateClient.getLatestRates(baseCurrency)
            ),
            this._fetchWithCache('newsapi', `news:${newsQuery.substring(0, 20)}`, () =>
                this.newsAPIClient.getEverything({ q: newsQuery })
            ),
            this._fetchWithCache('fred', `economic:${fredSeriesId}`, () =>
                this.fredClient.getSeriesObservations({ seriesId: fredSeriesId })
            ),
            this._fetchWithCache('finnhub', 'marketnews:general', () =>
                this.finnhubClient.getMarketNews()
            ),
        ];

        // Execute all calls in parallel with fault tolerance
        const results = await Promise.allSettled(apiCalls);

        // Process results
        const data = {
            stock: null,
            crypto: null,
            forex: null,
            news: [],
            economic: null,
            marketNews: [],
        };
        const errors = [];

        const serviceNames = ['alpha_vantage', 'coingecko', 'exchangerate_api', 'newsapi', 'fred', 'finnhub'];
        const dataKeys = ['stock', 'crypto', 'forex', 'news', 'economic', 'marketNews'];

        results.forEach((result, index) => {
            const service = serviceNames[index];
            const dataKey = dataKeys[index];
            const callStart = Date.now();

            if (result.status === 'fulfilled') {
                const { data: fetchedData, fromCache } = result.value;

                // Handle special cases for arrays
                if (dataKey === 'news' && fetchedData.articles) {
                    data.news = fetchedData.articles;
                } else if (dataKey === 'marketNews' && fetchedData.news) {
                    data.marketNews = fetchedData.news;
                } else {
                    data[dataKey] = fetchedData;
                }

                if (fromCache) {
                    cacheHits++;
                }

                apiCallResults.push({
                    service,
                    status: fromCache ? 'cached' : 'success',
                    duration: Date.now() - callStart,
                    cached: fromCache,
                });
            } else {
                const error = result.reason;
                errors.push({
                    service,
                    code: error.code || 'E1009',
                    message: error.message || 'Unknown error',
                });

                apiCallResults.push({
                    service,
                    status: 'error',
                    duration: Date.now() - callStart,
                    cached: false,
                    errorCode: error.code || 'E1009',
                    errorMessage: error.message || 'Unknown error',
                });

                logger.error(`API call failed: ${service}`, {
                    requestId,
                    service,
                    error: error.message,
                });
            }
        });

        const totalDuration = Date.now() - startTime;
        const successCount = apiCallResults.filter(r => r.status !== 'error').length;
        const status = errors.length === 0 ? 'success' : errors.length < 6 ? 'partial' : 'error';

        // Build response
        const response = {
            requestId,
            timestamp: new Date().toISOString(),
            status,
            data,
            errors,
            metadata: {
                totalDuration,
                cacheHits,
                apiCallsMade: 6 - cacheHits,
            },
        };

        // Save audit log
        try {
            await this.auditLogRepository.create({
                requestId,
                timestamp: new Date(),
                status,
                totalDuration,
                apiCalls: apiCallResults,
                cacheHits,
                apiCallsMade: 6 - cacheHits,
            });
        } catch (error) {
            logger.error('Failed to save audit log', { requestId, error: error.message });
        }

        logger.info('Financial data orchestration complete', {
            requestId,
            status,
            totalDuration,
            cacheHits,
            successCount,
            errorCount: errors.length,
        });

        return response;
    }

    // Helper: fetch with caching
    async _fetchWithCache(service, cacheKey, fetchFn) {
        const fullKey = this.cache.buildKey(service, cacheKey);
        const ttl = this.cache.getTTL(service);

        return this.cache.getOrSet(fullKey, fetchFn, ttl);
    }

    // Get cached data only - no API calls
    async getCachedData() {
        const services = ['alpha_vantage', 'coingecko', 'exchangerate_api', 'newsapi', 'fred', 'finnhub'];
        const cacheKeys = ['stocks:IBM', 'crypto:bitcoin,ethereum', 'forex:USD', 'news:finance OR stock mar', 'economic:GDP', 'marketnews:general'];

        const data = {};
        let hasData = false;

        for (let i = 0; i < services.length; i++) {
            const key = this.cache.buildKey(services[i], cacheKeys[i]);
            const cached = await this.cache.get(key);
            if (cached) {
                data[services[i]] = cached;
                hasData = true;
            }
        }

        return hasData ? data : null;
    }
}

export default FinancialDataService;
