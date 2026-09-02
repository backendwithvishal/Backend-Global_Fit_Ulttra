// Financial data aggregation - pulls from Alpha Vantage, CoinGecko, FRED, NewsAPI, etc.
// Two modes: /live (slow, real-time) and /cached (fast, Redis)
export class FinancialController {
    constructor(dependencies) {
        this.financialDataService = dependencies.financialDataService;
        this.socketManager = dependencies.socketManager;
    }

    // Fetch fresh data from all APIs - slow but real-time, broadcasts to WebSocket clients
    async getLive(req, res, next) {
        try {
            const options = {
                stockSymbol: req.query.symbol || 'IBM',
                cryptoIds: req.query.crypto || 'bitcoin,ethereum',
                baseCurrency: req.query.currency || 'USD',
                newsQuery: req.query.newsQuery || 'finance OR stock market',
                fredSeriesId: req.query.fredSeries || 'GDP',
            };

            const data = await this.financialDataService.execute(options);

            // Broadcast to WebSocket clients if successful
            if (data.status !== 'error') {
                this.socketManager.broadcastFinancialData(data);
            }

            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    }

    // Get cached data from Redis - fast, no external API calls
    async getCached(req, res, next) {
        try {
            const cachedData = await this.financialDataService.getCachedData();

            if (!cachedData) {
                return res.status(404).json({
                    error: {
                        code: 'E1010',
                        message: 'No cached data available',
                    },
                    requestId: req.requestId,
                });
            }

            res.status(200).json({
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                status: 'cached',
                data: cachedData,
                metadata: {
                    fromCache: true,
                },
            });
        } catch (error) {
            next(error);
        }
    }
}

export default FinancialController;