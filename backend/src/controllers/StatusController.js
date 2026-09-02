// System status monitoring - circuit breakers and rate limits
// Useful for ops dashboards and debugging API issues

export class StatusController {
    constructor(dependencies) {
        this.apiClients = dependencies.apiClients || [];
    }

    // Check circuit breaker states - closed (healthy), open (down), half-open (testing)
    getCircuitBreakers(req, res) {
        const states = this.apiClients.map(client => client.getCircuitBreakerStatus());

        res.status(200).json({
            circuitBreakers: states,
            requestId: req.requestId,
            timestamp: new Date().toISOString(),
        });
    }

    // Show rate limits for each API - usage tracking not implemented yet
    getRateLimits(req, res) {
        const rateLimits = {
            alpha_vantage: { limit: 5, period: '1 minute', usage: 'N/A' },
            coingecko: { limit: 50, period: '1 minute', usage: 'N/A' },
            exchangerate_api: { limit: 1500, period: '1 month', usage: 'N/A' },
            newsapi: { limit: 100, period: '1 day', usage: 'N/A' },
            fred: { limit: 'unlimited', period: 'N/A', usage: 'N/A' },
            finnhub: { limit: 60, period: '1 minute', usage: 'N/A' },
        };

        res.status(200).json({
            rateLimits,
            requestId: req.requestId,
            timestamp: new Date().toISOString(),
        });
    }
}

export default StatusController;